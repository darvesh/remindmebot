import { type TimeComponents } from "https://esm.sh/parse-ms@3.0.0";

export const wait = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));

export const processTime = (str: string) =>
	str
		.trim()
		.replace(/d|days/g, "day")
		.replace(/m|min|minutes/g, "minute")
		.replace(/s|sec|seconds/g, "second")
		.replace(/h|hr|hours/g, "hour");

const plural = (u: number) => (u > 1 ? "s" : "");

export const formatTime = (time: TimeComponents) =>
	`${time.days ? `${time.days} day${plural(time.days)} ` : ""}${
		time.hours ? `${time.hours} hour${plural(time.hours)} ` : ""
	}${time.minutes ? `${time.minutes} minute${plural(time.minutes)} ` : ""}${
		time.seconds ? `${time.seconds} second${plural(time.seconds)} ` : ""
	}`;

const escapables = {
	"<": "&lt;",
	">": "&gt;",
	"&": "&amp;",
	"'": "&#39;",
	'"': "&quot;",
};
export const escapeHTML = (s: string) =>
	s.replace(/<|>|&|"|'/g, (r) => escapables[r as keyof typeof escapables] || r);
