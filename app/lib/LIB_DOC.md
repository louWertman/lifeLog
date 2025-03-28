# Documentation
Documentation and usage guide for the entry and dataManagement classes/files.
    - dataManagement.ts: Functions related to syncing to the local file or the database and any entry retrieval functions
    - entity.ts - contians the  

## Save File Layout
The format will be defined by date headers
DATE, MOOD, HABIT, ENTRY

Delimeter will be a string of the following characters:
@~~@DELIM@~~@

Since we will be dealing with plain-text entries it is important for the delimiter to be as "unique" as possible. Additionally there should be checks somewhere to make sure that this string of charecters is not included in any place the user can input text/string data.

## dataManagement.ts
for any classes and function relating to data management
### SyncToFile
Syncs the data to a file and has the following classes

## entity.ts
This file contains the Entry and the Habit classes. There are discussed in more detail below

### Entry
The entry class has the following functions

    - constructor(date: string)
    - getMoods()
    - getHabits()
    - getTextEntry()
    - setMoods(moodsInput: Array<string>)
    - setTextEntry(inputText: string)

### Habit
    - constructor(name: string)
    - setPositive()
    - setNegative()
    - setActive()
    - setDormant()
    - getStatus()
        - Get Status returns an array with the following information:
        [0] - 'Name'
        [1] - 'Active' or 'Dormant'
        [2] - 'Positive' or 'Negative'