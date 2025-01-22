# Documentation
Documentation and usage guide for the entry and dataManagement classes/files.
    - dataManagement.ts: Functions related to syncing to the local file or the database and any entry retrieval functions
    - entry.ts: An object that stores data regarding entries. Stores the date, mood, habits, and entry log. Other relevant objects can be stored here

## Save File Layout
The format will be defined by date headers
DATE, MOOD, HABIT, ENTRY

Delimeter will be a string of the following characters:
@~~@DELIM@~~@

Since we will be dealing with plain-text entries it is important for the delimiter to be as "unique" as possible. Additionally there should be checks somewhere to make sure that this string of charecters is not included in any place the user can input text/string data.

## dataManagement.ts

## entry.ts