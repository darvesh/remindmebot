import {
	equal,
	assertStrictEquals,
} from "https://deno.land/std@0.140.0/testing/asserts.ts";

import { PATTERN } from "../constant.ts";

Deno.test("time 1", () => {
	const m = "/remindme 1h";
	const elems = m.match(PATTERN)!;
	const [time] = [...elems.slice(1, 2)];

	assertStrictEquals(time, "1h");
});

Deno.test("time 2", () => {
	const m = "/remindme 1h1m";
	const elems = m.match(PATTERN)!;
	const [time] = [...elems.slice(1, 2)];
	assertStrictEquals(time, "1h1m");
});

Deno.test("time 3", () => {
	const m = "/remindme 11h11m";
	const elems = m.match(PATTERN)!;
	const [time] = [...elems.slice(1, 2)];
	assertStrictEquals(time, "11h11m");
});

Deno.test("time 4", () => {
	const m = "/remindme 11h11m2s";
	const elems = m.match(PATTERN)!;
	const [time] = [...elems.slice(1, 2)];
	assertStrictEquals(time, "11h11m2s");
});

Deno.test("time 5", () => {
	const m = "/remindme 11h11m2s10";
	const elems = m.match(PATTERN)!;
	equal(elems, null);
});

Deno.test("with message 1", () => {
	const m = "/remindme 3h1m\nmessage";
	const elems = m.match(PATTERN)!;
	const [time, message] = [...elems];
	equal([time, message], ["3h1m", "message"]);
});

Deno.test("with message 2", () => {
	const m = "/remindme 3h1m45s\nmessage\nmessage1";
	const elems = m.match(PATTERN)!;
	const [time, message] = [...elems];
	equal([time, message], ["3h1m45s", "message\nmessage1"]);
});

Deno.test("with message 3", () => {
	const m = "/remindme 3h1m45s\nmessage\nmessage1\nmessage2";
	const elems = m.match(PATTERN)!;
	const [time, message] = [...elems];
	equal([time, message], ["3h1m45s", "message\nmessage1\nmessage2"]);
});

Deno.test("with message 4", () => {
	const m =
		"/remindme 3h1m45s\nmessage\nmessage1\nmessage2[]$()\\/*%@!^-_=+?<>.~`'\"";
	const elems = m.match(PATTERN)!;
	const [time, message] = [...elems];
	equal(
		[time, message],
		["3h1m45s", "message\nmessage1\nmessage2[]$()\\/*%@!^-_=+?<>.,~`'\""]
	);
});
