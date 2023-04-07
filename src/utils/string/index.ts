/**
 * `copyToClipboard` copies text to a user's clipboard.
 * @param textToCopy - text to be copied
 */
export const copyToClipboard = async (textToCopy: string) => {
  await navigator.clipboard.writeText(textToCopy);
};

/**
 * `getJiraFormat` uses the applied bookmarks to construct a JIRA formatted string.
 * @param bookmarks  - array of numbers representing the applied bookmarks
 * @param getLine - function that retrieves the log text associated with a log line number
 * @returns formatted string that can be pasted into JIRA
 */
export const getJiraFormat = (
  bookmarks: number[],
  getLine: (lineNumber: number) => string | undefined
) => {
  if (bookmarks.length === 0) {
    return "";
  }

  let jiraString = "{noformat}\n";

  for (let i = 0; i < bookmarks.length; i++) {
    const bookmarkLine = bookmarks[i];
    const logText = getLine(bookmarkLine);

    // If bookmarks is out of bounds, stop processing.
    if (logText === undefined) {
      break;
    }

    jiraString += `${logText}\n`;

    // If the current and next bookmark are not adjacent to each other, insert an
    // ellipsis in between them.
    if (i + 1 !== bookmarks.length && bookmarkLine + 1 !== bookmarks[i + 1]) {
      jiraString += "...\n";
    }
  }
  jiraString += "{noformat}";
  return jiraString;
};

/**
 * `processLogString` is used to turn a single string into an array of of log lines.
 * @param logString - a single string representing the entire log file
 * @returns an array of log lines
 */
export const processLogString = (logString: string) =>
  logString.trimEnd().split("\n");

/**
 * `stringIntersection` returns a boolean indicating if two strings have a full overlap
 * @param string1
 * @param string2
 * @returns - Boolean indicating if string1 or string2 fit into the other.
 */
export const stringIntersection = (string1: string, string2: string) =>
  string1.includes(string2) || string2.includes(string1);

/**
 * @param str - A string that represents a githash
 * @return {string} A shortenend version of the input string.
 */
export const shortenGithash = (str?: string) => str?.substring(0, 7);

/**
 * Function that trims the middle portion of a string. ex: "EvergreenUI" -> "Ev...UI"
 * The resulting length, if trimmed, is maxLength + 1 (due to ellipsis length).
 * @param {string} str - Text to trim
 * @param {number} maxLength - Max length before trimming text
 * @return {string} The original or trimmed text.
 */
export const trimStringFromMiddle = (str: string, maxLength: number) => {
  const ellipsis = "…";
  const numCharsToRemove = str.length - maxLength;

  // if ellipsis would make the string longer/same, just return original string
  if (numCharsToRemove <= ellipsis.length) {
    return str;
  }

  const midpoint = Math.floor(str.length / 2);
  const frontOffset = Math.floor(numCharsToRemove / 2);
  const backOffset = Math.ceil(numCharsToRemove / 2);
  return (
    str.substring(0, midpoint - frontOffset) +
    ellipsis +
    str.substring(midpoint + backOffset)
  );
};
