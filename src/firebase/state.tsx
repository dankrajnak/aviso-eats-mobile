import importedShuffle from "fast-shuffle";
// import * as ip from "ip";
import _ from "lodash";
import React, { FC } from "react";

import API, { FirebaseState } from "./api";
import config from "./config";
import { getStartOfDayEST } from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shuffle: any = importedShuffle;

// All the types
export type User = {
  username: string;
  checkedIn: number;
  ip: string;
};

export type Restaurant = {
  id: number;
  name: string;
  website: string;
  price: number;
};

export type Vote = {
  username: string;
  optionId: number;
  yes: boolean;
  date: number;
};

export type State = {
  currentOption: RestaurantWithStatus | null | undefined;
  users: User[];
  restaurants: Restaurant[];
  checkedInUsers: User[];
  votesForCurrentOption: Vote[];
  me: User | null;
  gracePeriodEnd: number | null;
  wrongVersion: boolean;
  setUsername: (username: string) => void;
  isDefault: boolean;
};

export type RestaurantWithStatus = {
  restaurant: Restaurant;
  chosen: boolean | null;
};

const restaurants = [
  {
    id: 1,
    name: "Emmets",
    website: "https://www.emmettscafe.com",
    price: 3,
  },
  {
    id: 2,
    name: "Loops",
    website: "https://www.loopsgoodfood.com",
    price: 2,
  },
  {
    id: 3,
    name: "Yats",
    website: "https://yatscajuncreole.com/wp/",
    price: 2,
  },
  {
    id: 4,
    name: "Krema Nut Company",
    website: "https://www.kremapickup.com",
    price: 1,
  },
  {
    id: 5,
    name: "Tiger + Lily",
    website: "https://www.tigerandlilybistro.com",
    price: 3,
  },
  {
    id: 6,
    name: "Brassica",
    website: "https://brassicas.com",
    price: 3,
  },
  {
    id: 7,
    name: "Chipotle",
    website: "https://www.chipotle.com",
    price: 1,
  },
  {
    id: 8,
    name: "Nongs",
    website: "https://www.nongshunanexpress.com/menu",
    price: 2,
  },
  {
    id: 9,
    name: "Brenz Pizza",
    website: "https://brenzpizzaco.com/columbus-oh",
    price: 2,
  },
  {
    id: 10,
    name: "Dewey's Pizza",
    website: "https://deweyspizza.com",
    price: 2,
  },
  {
    id: 11,
    name: "Smokehouse Brewing",
    website: "http://www.smokehousebrewing.com/",
    price: 3,
  },
  {
    id: 12,
    name: "Si Senior",
    website: "https://www.sisenorcolumbus.com/",
    price: 2,
  },
  {
    id: 13,
    name: "High Bank Distillery",
    website: "https://www.highbankco.com/",
    price: 2,
  },
  {
    id: 13,
    name: "DK Diner",
    website: "http://www.thedkdiner.com/",
    price: 2,
  },
  {
    id: 14,
    name: "Chocolate Cafe",
    website: "https://www.chocolatecafecolumbus.com/",
    price: 3,
  },
];
restaurants.sort((a, b) => a.name.localeCompare(b.name));

const defaultState: State = {
  currentOption: null,
  users: [],
  restaurants,
  me: null,
  checkedInUsers: [],
  votesForCurrentOption: [],
  gracePeriodEnd: null,
  wrongVersion: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUsername: () => {},
  /**
   * Whether or not this is the default state.
   */
  isDefault: true,
};

// Three minutes
const gracePeriod = 1000 * 60;

export const StateContext = React.createContext<State>(defaultState);

export const StateProvider: FC = ({ children }) => {
  const [firebaseState, setFirebaseState] =
    React.useState<FirebaseState | null>(null);

  const [counter, setCounter] = React.useState(1);

  const [username, setUsername] = React.useState<string | null>(null);

  const state = React.useMemo<State>(() => {
    if (!firebaseState) {
      return defaultState;
    } else {
      // map firebase state to State
      const startOfDayEST = getStartOfDayEST();
      // shuffled options
      const options: Restaurant[] = shuffle(startOfDayEST)(restaurants);

      const todaysVotes =
        _.filter(firebaseState.votes, (vote) => vote.date > startOfDayEST) ||
        [];

      const restaurantsWithStatus: RestaurantWithStatus[] = options.map(
        (option) => {
          const votesForOption =
            _.filter(todaysVotes, (vote) => vote.optionId === option.id) || [];
          // If there are more votes than the quorumSize
          const quorumSize = firebaseState.quorumSize;
          if (votesForOption.length >= quorumSize) {
            // count the votes
            let yays = 0;
            let nays = 0;
            const orderedVotes = _.sortBy(votesForOption, ["date"]);

            // Count the votes that are in the quorum.
            const quorumVotes = _.take(orderedVotes, quorumSize);
            quorumVotes.forEach((vote) => {
              if (vote.yes) {
                yays++;
              } else {
                nays++;
              }
            });

            //Every vote after the quorum has to have been taken within the grace period.
            const orderedVotesWithoutQuorum = _.drop(orderedVotes, quorumSize);
            let quorumDate = _.last(quorumVotes)?.date || 0;
            if (orderedVotesWithoutQuorum?.length) {
              quorumDate = orderedVotesWithoutQuorum[0]?.date || 0;

              for (const vote of orderedVotesWithoutQuorum) {
                if (vote.date <= quorumDate + gracePeriod) {
                  if (vote.yes) {
                    yays++;
                  } else {
                    nays++;
                  }
                } else {
                  break;
                }
                quorumDate = vote.date;
              }
            }
            if (new Date().getTime() > quorumDate + gracePeriod) {
              return { restaurant: option, chosen: yays > nays };
            }
          }
          return { restaurant: option, chosen: null };
        }
      );

      // current Restaurant
      // Current restaurant is the first option that is not decided or was chosen
      const currentOption = _.find(
        restaurantsWithStatus,
        (rs) => rs.chosen || rs.chosen === null
      );

      const votesForCurrentOption =
        _.chain(todaysVotes)
          .filter((vote) => vote.optionId === currentOption?.restaurant.id)
          .sortBy("username")
          .value() || [];

      const calcState: State = {
        currentOption,
        me: _.chain(firebaseState.users)
          .filter((user) => !!username && user.username === username)
          .orderBy(["checkedIn"], ["desc"])
          .first()
          .value(),
        users: _.sortBy(firebaseState.users, ["username"]) ?? [],
        checkedInUsers:
          _.sortBy(firebaseState.checkedInUsers, ["username"]) ?? [],
        votesForCurrentOption,
        gracePeriodEnd:
          votesForCurrentOption?.length >= firebaseState.quorumSize
            ? _.chain(votesForCurrentOption).sortBy("date").last().value()
                .date + gracePeriod
            : null,
        setUsername,
        restaurants,
        wrongVersion: config.version !== firebaseState.version,
        isDefault: false,
      };
      return calcState;
    }
  }, [firebaseState, username]);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (state.gracePeriodEnd && state.gracePeriodEnd > new Date().getTime()) {
      timeout = setTimeout(() => {
        setCounter((c) => c + 1);
      }, state.gracePeriodEnd - new Date().getTime() + 100);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  });

  React.useEffect(() => {
    const detach = API.getState((firebaseState) => {
      setFirebaseState(firebaseState);
    });
    return () => {
      detach();
    };
  }, [counter]);

  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
};

export const useRemote = (): State => React.useContext(StateContext);
