# App/Lib/ Documentation
Documentation and usage guide for the entry, ProcStat, and dataManagement classes/files.
    - dataManagement.ts: Functions related to syncing to the local file or the database and any entry retrieval functions
    - entity.ts - contains habit and entry objects

## Save File Layout
The format will be defined by date headers
DATE, MOOD, HABIT, ENTRY

Delimeter will be a string of the following characters:
@~~@DELIM@~~@

Since we will be dealing with plain-text entries it is important for the delimiter to be as "unique" as possible. Additionally there should be checks somewhere to make sure that this string of charecters is not included in any place the user can input text/string data.

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

## Entry and FileSystem Usage

### dataManagement.ts
This module handles syncing data to local files or databases and retrieving entries.

#### FileSystem Usage Examples

##### Initialize FileSystem
```typescript
import { FileSystem } from "../app/lib/dataManagement";

let fs = new FileSystem();
```
The `FileSystem` class abstracts file management for saving entry data and settings, it is giving cross-platform compatibility.

##### Load an Entry
```typescript
let entry = await fs.loadEntry("2023-10-01");
console.log(entry);
```
Loads an entry for a specific date.

##### Save an Entry
```typescript

let habitList: Habit[];
let entryData = {
    date: "2023-10-01",
    mood: "Happy",
    habits: habitList,
    text: "Had a great day!"
};
await fs.saveEntry(entryData);
```
Saves an entry with the specified data.

---

### entity.ts
This file contains the `Entry` and `Habit` classes.

#### Entry Class Usage Examples

##### Create a New Entry
```typescript
import { Entry } from "../app/lib/entity";

let entry = new Entry("2023-10-01");
entry.setMoods(["Happy", "Excited"]);
entry.setTextEntry("Started a new project today!");
console.log(entry.getMoods());
console.log(entry.getTextEntry());
```

#### Habit Class Usage Examples

##### Create a new habit and update Habits
if a habitName exists it will create a habit and save to settings.json, otherwise it will update the attributes
```typescript
import { Habit } from "../app/lib/entity";

let habit = new Habit("Running");
habit.setPositive();
habit.setActive();

console.log(habit.getStatus()); // ["Running", "Active", "Positive"]
```

---

### Habit Management with FileSystem

##### List All Habits
```typescript
let habitList = await fs.listAllHabits();
console.log(habitList);
```

##### List Active Habits (non-dormant)
```typescript
let activeHabits = await fs.listHabits();
console.log(activeHabits);
```

##### Convert Habits to String
```typescript
let habitString = fs.habitsToString(habitList);
console.log(habitString);
```

##### Convert String to Habits
```typescript
let habitArray = fs.stringToHabits(habitString);
console.log(habitArray);
```

##### Save or Update a Habit
```typescript
let habitName = "Meditation";
let positive = true;
let active = true;

fs.habitControl(habitName, positive, active);
```

##### Delete a Habit
```typescript
fs.deleteHabit("Meditation");
```

---

### Settings Management

#### Load Settings
```typescript
let settings = load_settings("config.json");
console.log(settings);
```

#### Update a Setting
```typescript
update_setting("config.json", "theme", "dark");
```

#### Save Settings
```typescript
save_settings("config.json", settings);
```

### PocStat and Statistical Processing
Initialize

```tsx
const processor = new ProcStat();
```
#### FetchHabits
Prepares and sanitizes data for showing and processing
```tsx
const habits = await procStat.fetchHabits();
```

#### moodData
Fetches mood data and returns a tuple, [moodnames, uniqueMoods]. Moodnames is for processing and uniqueMoods is for display

```tsx
const moods = await procStat.fetchMoods();
```

### habit Mood Connections
Used for processing connections between moods and habits

```tsx
const moods = await procStat.habitMoodProc(habit.name);
```

### Positive Habits Over Time
Process occurence of positive habits over a week, month, and year
Accepted Inputs: 'Week', 'Month', 'Year'

```tsx
const moods = await procStat.positiveHabitProc('Month');
```

### Negative Habits Over Time
Process occurence of negative habits over a week, month, and year
Accepted Inputs: 'Week', 'Month', 'Year'

```tsx
const moods = await procStat.negativeHabitProc('Week');
```

### Entry Length Over Time
Process how long entries are over a specified period of time
Accepted Inputs: 'Week', 'Month', 'Year'

```tsx
const moods = await procStat.consistencyProc('Year');
```
