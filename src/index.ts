#!/usr/bin/env node
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

import * as core from "@actions/core";

import { formatMarkdownDiff, formatShellDiff } from "./format";
import { loadReports, computeDiffs } from "./report";

const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Display this usage guide.",
  },
  {
    name: "src",
    alias: "s",
    type: String,
    multiple: true,
    description: "The relative paths to convert report.",
    typeLabel: "<files>",
    defaultOption: true,
    defaultValue: [],
  },
  {
    name: "title",
    alias: "t",
    type: String,
    description: "The title displayed in the markdown output.",
    typeLabel: "<string>",
    defaultValue: "Changes to gas costs",
  },
  {
    name: "ignore",
    alias: "i",
    type: String,
    description: "The list of paths from which to ignore gas reports, separated by a comma.",
    typeLabel: "<string>",
    defaultValue: "",
  },
  {
    name: "match",
    alias: "m",
    type: String,
    description: "The list of paths of which only to keep gas reports, separated by a comma.",
    typeLabel: "<string>",
    defaultValue: "",
  },
];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  console.log(
    commandLineUsage([
      {
        header: "Foundry Gas Diff",
        content: "🚀🖨️  Automatically generates your Solidity contracts' interfaces",
      },
      {
        header: "Options",
        optionList: optionDefinitions,
      },
      {
        content: "Project home: {underline https://github.com/rubilmax/foundry-gas-report}",
      },
    ])
  );
} else {
  try {
    if (options.src.length !== 2) throw Error("Exactly 2 different gas reports must be specified!");

    const loadOptions = {
      ignorePatterns: options.ignore.split(","),
      matchPatterns: options.match || undefined,
    };
    const sourceReports = loadReports(options.src[0], loadOptions);
    const compareReports = loadReports(options.src[1], loadOptions);
    const diffRows = computeDiffs(sourceReports, compareReports);

    const shell = formatShellDiff(diffRows);
    const markdown = formatMarkdownDiff(options.title, diffRows);

    console.log(shell);

    core.setOutput("shell", shell);
    core.setOutput("markdown", markdown);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
