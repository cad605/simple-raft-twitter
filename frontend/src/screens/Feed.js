import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../components/Error";
import List from "../components/List";
import FeedListItem from "../components/FeedListItem";
import axios from "axios";
import ComposeTweet from "../components/ComposeTweet";

export default function Feed() {
  const API = "http://localhost:8080/api/v1/getFeedByUser/1";

  const [state, setState] = useState({
    status: "pending",
    results: null,
    error: null,
  });
  const { status, results, error } = state;

  async function queryDatabase() {
    const request = axios.get(API);

    return axios.all([request]).then(
      axios.spread(async (...responses) => {
        if (responses && responses[0]["data"]["data"]["success"]) {
          return responses[0]["data"]["data"]["tweet"];
        } else {
          const error = {
            message: responses?.errors?.map((e) => e.message).join("\n"),
          };
          return Promise.reject(error);
        }
      })
    );
  }
  useEffect(() => {
    setState({ ...state, status: "pending" });
    queryDatabase().then(
      (results) => {
        setState({ ...state, status: "resolved", results });
      },
      (error) => {
        setState({ ...state, status: "rejected", error });
      }
    );
  }, []);

  if (status === "pending") {
    return <p>Loading...</p>;
  } else if (status === "rejected") {
    console.log("throwing error");
    throw error;
  } else if (status === "resolved") {
    return (
      <>
        <div className="container h-14 bg-white border-solid border-slate-200 border-b">
          <div className="py-4 px-4">
            <h1 className="font-bold text-lg">Home</h1>
          </div>
        </div>
        <ComposeTweet></ComposeTweet>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <List>
            {results.map((tweet) => (
              <FeedListItem key={tweet["id"]} tweet={tweet} />
            ))}
          </List>
        </ErrorBoundary>
      </>
    );
  }
}