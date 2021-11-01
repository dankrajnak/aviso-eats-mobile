import { Database, off, set } from "@firebase/database";
import axios from "axios";
import { onValue, ref, remove } from "firebase/database";

import FirebaseManager from "./FirebaseManager";
import { Restaurant, User, Vote } from "./state";

export type FirebaseState = {
  users: User[];
  checkedInUsers: User[];
  options: Restaurant[];
  votes: Vote[];
  quorumSize: number;
  version: string;
};

type SerializedDate = number;

const serializeDate = (date: Date): SerializedDate => date?.getTime();

class APIService {
  private database: Database;
  constructor() {
    this.database = FirebaseManager.database;
  }

  private getUserReference(username: string) {
    if (!username) {
      throw new Error("username cannot be null");
    }
    return `users/${username}`;
  }

  private getCheckedInReference(username: string) {
    if (!username) {
      throw new Error("username cannot be null");
    }
    return `checkedInUsers/${username}`;
  }

  private getVoteReference(username: string, optionId: number) {
    if (!username) {
      throw new Error("username cannot be null");
    }
    if (!optionId) {
      throw new Error("optionId cannot be null");
    }

    return `votes/${username}-${optionId}`;
  }

  async checkIntoSlack(username: string): Promise<void> {
    const slackHook = process.env.SLACK_HOOK;
    if (slackHook) {
      await axios.post(
        slackHook,

        { username }
      );
    }
  }

  async checkIn(username: string): Promise<void> {
    const me = {
      username,
      checkedIn: serializeDate(new Date()),
      ip: Math.random() * 10000,
    };
    await Promise.all([
      set(ref(this.database, this.getUserReference(username)), me),
      set(ref(this.database, this.getCheckedInReference(username)), me),
    ]);
    try {
      await this.checkIntoSlack(username);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  vote(username: string, optionId: number, yes: boolean) {
    if (!username) {
      throw new Error("username is required");
    }
    if (!optionId) {
      throw new Error("optionId is required");
    }
    if (yes == null) {
      throw new Error("yes is required");
    }
    set(ref(this.database, this.getVoteReference(username, optionId)), {
      username,
      optionId,
      yes,
      date: serializeDate(new Date()),
    });
  }

  checkOut(username: string) {
    remove(ref(this.database, this.getCheckedInReference(username)));
  }

  getState(handler: (state: FirebaseState) => void): () => void {
    const allRef = ref(this.database, "/");
    onValue(allRef, (snapshot) => {
      const val = snapshot.val();
      const firebaseState: FirebaseState = {
        users: Object.values(val?.users ?? {}),
        checkedInUsers: Object.values(val?.checkedInUsers ?? {}),
        options: Object.values(val?.options ?? {}),
        votes: Object.values(val?.votes ?? {}),
        quorumSize: val?.quorumSize || 2,
        version: val?.version,
      };
      handler(firebaseState);
    });
    return () => off(allRef);
  }
}

const API = new APIService();

export default API;
