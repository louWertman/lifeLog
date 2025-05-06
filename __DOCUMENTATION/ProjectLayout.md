# LifeLog Project Layout

## Root
There are many files and directories here, the overwhelming majority created and handled automatically. Only edit these for very specific edits. There are a few files of interest that are not part of the react project.

- Database/ : Contains server side database files such as how our table is set up
    - PythonDatabaseInteractExample.py - Unit Test of the Database
    - LifeLogNew.sql and LifeLogDB.sql - Latest and previous version of the LifeLog database respectively

- android/ and ios/ - build folders of the IOS and Android versions respectively.

## App
App has css/ and lib/ along with some tsx files for dispaying the main/default page listEntry along with general page set up such as the sidebar.

- __DOCUMENTATION / : Documentation Folder
- css/ : Contains the project's css
- lib/ : contains the backend and controller/logical code
    * LIB_DOC.md : contains full documentation how to use the classes in the lib folder
    * entity.tsx : contains the objects for entry and habit
    * DataManagement.tsx : FileSystem class that is an abstraction for handling entries, habits, and settings
    * procStat : statistical processing functions
- Page.tsx : page template that handles the sidebar and changing view
- entryview.tsx : vestigial organ of the original default page, project now uses listEntry in components
- layout.tsx : boiler plate react layout page

## Components
These contain the majority of what the user interacts with

- graphs/ : contains react component rechart graphs displayed in statistics
    * chart.tsx : habits to mood graph
    * Consistency.tsx : entry length over time
    * Negative.tsx : Negative habits overtime
    * Positive.tsx : Positive Habits overtime 

- Calendar.tsx : Displays and handles side Calendar
- EditEntry.tsx : Handles and displays the editEntry component
- editorhabit.tsx: Displays, Add, delete, and edit habits
- entry.tsx : abstract entry object for displaying entries
- EntryList.tsx : list entries, call editEntry upon click
- Export.tsx : export button
- habits.tsx : display drop down habit select menu
- Settings.tsx : handle settings
- StatisticsV : Statistics page to select what to process statistics on
- ViewEntry : Concrete entry.tsx