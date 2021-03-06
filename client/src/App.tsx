import React, { useEffect, useState, useReducer } from "react";

import { MoonIcon, SunIcon } from "@heroicons/react/outline";

import Logo from "./components/Logo";
import UrlForm from "./components/UrlForm";
import ShortUrlDisplay from "./components/ShortUrlDisplay";

interface InitialAppState {
  state: "initial";
  url: string;
  loading?: boolean;
  error: Error | null;
}

interface FinalAppState {
  state: "final";
  shortUrl: string;
  copied: boolean;
}

type AppState = InitialAppState | FinalAppState;

type AppAction =
  | { type: "SET_URL"; url: string }
  | { type: "URL_SUBMITTED" }
  | { type: "GOT_SLUG"; shortUrl: string }
  | { type: "CREATE_FAILED"; error: Error }
  | { type: "BACK_CLICKED" };

const initialState: InitialAppState = {
  state: "initial",
  url: "",
  error: null,
};

function App() {
  const [state, dispatch] = useReducer((state: AppState, action: AppAction) => {
    switch (action.type) {
      case "SET_URL":
        if (state.state !== "initial") {
          throw new Error(
            `Cannot handle action ${action.type} while in state '${state.state}'`
          );
        }

        return {
          ...state,
          url: action.url,
          error: null,
        };
      case "URL_SUBMITTED":
        if (state.state !== "initial") {
          throw new Error(
            `Cannot handle action ${action.type} while in state '${state.state}'`
          );
        }

        return {
          ...state,
          error: null,
          loading: true,
        };

      case "GOT_SLUG":
        if (state.state !== "initial") {
          throw new Error(
            `Cannot handle action ${action.type} while in state '${state.state}'`
          );
        }

        return {
          state: "final",
          shortUrl: action.shortUrl,
          copied: false,
        } as const;
      case "CREATE_FAILED":
        if (state.state !== "initial") {
          throw new Error(
            `Cannot handle action ${action.type} while in state '${state.state}'`
          );
        }

        return {
          ...state,
          loading: false,
          error: action.error,
        };
      case "BACK_CLICKED":
        if (state.state !== "final") {
          throw new Error(
            `Cannot handle action ${action.type} while in state '${state.state}'`
          );
        }

        return initialState;
    }
  }, initialState);

  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        "matchMedia" in window &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      <button
        className={`absolute top-1 right-1 p-2 ${
          darkMode ? "hover:text-yellow-200" : "hover:text-indigo-600"
        }`}
        onClick={() => {
          const nextDarkMode = !darkMode;
          setDarkMode(nextDarkMode);
          localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
        }}
        aria-label="Change theme"
      >
        {darkMode ? (
          <SunIcon className="w-6 h-6" />
        ) : (
          <MoonIcon className="w-6 h-6" />
        )}
      </button>

      <div className="max-w-2xl mx-auto px-2 flex flex-col justify-center min-h-screen">
        <header className="mb-2">
          <Logo />
        </header>

        <main>
          {state.state === "initial" ? (
            <>
              <UrlForm
                url={state.url}
                onUrlChange={(url) => {
                  dispatch({ type: "SET_URL", url });
                }}
                onCreateFulfilled={(slug) => {
                  dispatch({
                    type: "GOT_SLUG",
                    shortUrl: new URL(slug, window.location.origin).href,
                  });
                }}
                onCreateRejected={(error) => {
                  dispatch({ type: "CREATE_FAILED", error });
                }}
              />

              {state.error && (
                <p className="mt-2 text-red-700">
                  Sorry, there was an error. Please try again.
                </p>
              )}
            </>
          ) : state.state === "final" ? (
            <ShortUrlDisplay
              shortUrl={state.shortUrl}
              onBackClick={() => {
                dispatch({ type: "BACK_CLICKED" });
              }}
            />
          ) : null}
        </main>
      </div>
    </>
  );
}

export default App;
