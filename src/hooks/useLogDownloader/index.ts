import { useEffect, useState } from "react";
import { isProduction } from "utils/environmentVariables";
import { leaveBreadcrumb, reportError } from "utils/errorReporting";

/**
 * `useLogDownloader` is a custom hook that downloads a log file from a given URL.
 * It downloads the log file and splits the log file into an array of strings.
 * Each string is split based on the newline character.
 * It returns an object with the following properties:
 * - isLoading: a boolean that is true while the log is being downloaded
 * - data: the log file as an array of strings
 * - error: an error message if the download fails
 *
 */
// const useLogDownloader = (url: string) => {
//   const [data, setData] = useState<string[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     leaveBreadcrumb("useLogDownloader", { url }, "request");
//     const req = new Request(url, { method: "GET" });
//     const abortController = new AbortController();
//     const fileReader = new FileReader();

//     fileReader.onload = () => {
//       const text = fileReader.result;
//       // @ts-expect-error
//       const lines = text?.split("\n");
//       setData(lines);
//       setIsLoading(false);

//       // Do something with the array of lines
//     };

//     fetch(req, {
//       credentials: "include",
//       // Conditionally define signal because AbortController throws error in development's strict mode
//       signal: isProduction ? abortController.signal : undefined,
//     })
//       .then((response) => {
//         console.log(response);
//         if (!response.ok) {
//           console.log("Throwing error");
//           throw new Error(`downloading log: ${response.status}`);
//         }
//         return response;
//       })
//       .then((response) => {
//         console.log("Blobbing");
//         return response.blob();
//       })
//       .then((blob) => {
//         leaveBreadcrumb(
//           "useLogDownloader",
//           { message: "Reached blob" },
//           "error"
//         );
//         console.log("Reached blob");
//         // setData(text.trimEnd().split("\n"));
//         fileReader.readAsText(blob);
//       })
//       .catch((err: Error) => {
//         console.log("error callback");
//         console.log(err);
//         leaveBreadcrumb("useLogDownloader", { url, err }, "error");
//         reportError(err).severe();
//         setError(err.message);
//       });
//     // .finally(() => {
//     //   setIsLoading(false);
//     // });
//     return () => {
//       // Cancel the request if the component unmounts
//       abortController.abort();
//     };
//   }, [url]);
//   return { data, error, isLoading };
// };
const useLogDownloader = (url: string) => {
  const [data, setData] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    leaveBreadcrumb("useLogDownloader", { url }, "request");
    const abortController = new AbortController();

    let result: string[] = [];
    let buffer = "";
    fetch(url, {
      credentials: "include",
      // Conditionally define signal because AbortController throws error in development's strict mode
      signal: isProduction ? abortController.signal : undefined,
    })
      .then((response) => {
        const reader = response.body?.getReader();

        // @ts-expect-error
        const read = () => {
          if (reader === undefined) {
            throw new Error("Reader is undefined");
          }
          return reader.read().then(({ done, value }) => {
            if (done) {
              return;
            }

            buffer += new TextDecoder("utf-8").decode(value);

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            result = result.concat(lines);
            if (result.length > 2000000) {
              abortController.abort();
              setError(`Log file too large  ${result.length} lines`);

              return;
            }
            return read(); // continue reading
          });
        };

        return read();
      })
      .then(() => {
        console.log("setting data", result.length);
        setData(result);
      })
      .catch((err: Error) => {
        leaveBreadcrumb("useLogDownloader", { url, err }, "error");
        reportError(err).severe();
        setError(err.message);
        if (result.length > 0) {
          console.log("setting data in catch block", result.length);
          setData(result);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => {
      // Cancel the request if the component unmounts
      abortController.abort();
    };
  }, [url]);
  return { data, error, isLoading };
};

export { useLogDownloader };
