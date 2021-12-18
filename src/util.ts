import parseMs from "parse-ms";

/** Neatly formats timestamp to days, hour, minute, second * */
export const convertTime = (timestamp: number) => {
	const time = parseMs(timestamp);
	const formatted = `${time.days ? `${time.days} day(s) ` : ""}${
		time.hours ? `${time.hours} hour(s) ` : ""
	}${time.minutes ? `${time.minutes} minute(s) ` : ""}${
		time.seconds ? `${time.seconds} second(s) ` : ""
	}`;
	return formatted;
};

/**
 * Change the time format to `(\d(day|hour|minute|second)\s)+`
 * @param str the time string received from the user. example: 1s, 3minutes, 5d3s, 3d4h3m4s
 * */
export const processTimeString = (str: string) =>
	str
		.substring(10)
		.replace(/d|days/g, "day")
		.replace(/m|min|minutes/g, "minute")
		.replace(/s|sec|seconds/g, "second")
		.replace(/h|hr|hours/g, "hour");
