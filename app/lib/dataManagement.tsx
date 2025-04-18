/*
Authors: Lou Wertman,
Purpose: Functions related to syncing to the local file or the database and any entry retrieval functions
*/

/******************************************************* */
/* PLEASE REFER TO LIB_DOC.MD for relavant documentation */
/******************************************************* */
'use client'

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import Papa from 'papaparse';

import { Entry, Habit } from './entity';

export class FileSystem {
    private filePath: Promise<string> = this.getSettings().then(settings => settings['entryFile']);

    //variables
    private entryLog: Promise<Entry[]> = this.filePath.then(filePath => this.loadFile());

    constructor() {
        this.entryLog = this.filePath.then(filePath => this.loadFile());
        this.filePath = this.getSettings().then(settings => settings['entryFile']);
    }

    //load and parse a file for the entryLog object
    public async loadFile() {
        //if the file exists create it
        try {
            await Filesystem.readFile({
                path: await this.filePath,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
        } catch (readError) {
            await Filesystem.writeFile({
                path: await this.filePath,
                directory: Directory.Data,
                data: 'DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY',
                encoding: Encoding.UTF8,
            });
        }

        let file = await Filesystem.readFile({
            path: await this.filePath,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });

        let entries = Array<Entry>();

        Papa.parse(file.data as string, {
            delimiter: "@~~@DELIM@~~@",
            skipEmptyLines: true,
            header: true,
            error: (error: any) => {
                console.error('Parse Error: ', error);
            },
            step: (entry: any) => {
                if (entry && entry.data) {
                    const habitString = entry.data['habits'] || "";

                    let newEntry = new Entry(
                        entry.data['DATE'],
                        entry.data['MOOD'],
                        this.stringToHabits(habitString),
                        entry.data['ENTRY']
                    );
                    console.log("DEBUG: New Entry: ", newEntry);
                    console.log(newEntry);
                    entries.push(newEntry);
                } else {
                    console.error("DEBUG: Invalid entry data: ", entry);
                }
            }
        });
        console.log("DEBUG: Entry loaded: ", entries);

        return entries;
    }


    //returns a string array with the date of every entry, latest entry first
    public async listEntries() {
        const entryLog = await this.entryLog;
        console.log("DEBUG: listEntries FSCLASS: ", entryLog);
        return entryLog.map((entry) => ({
            date: entry.getDateEntry(),
            content: entry.getTextEntry(),
            habits: entry.getHabits(),
            mood: entry.getMoods(),
        }));
    }
    //finds an entry with a date, returns an Entry object
    public async fetchEntry(date: string) {
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            if (entryLog[i].getDateEntry() === date) {
                return entryLog[i];
            }
        }
        return null;
    }

    public stringToHabits(habitString: string) {
        console.trace("DEBUG: stringToHabits: " + habitString);
        if (habitString === "") {
            return this.generateStockHabits();
        }
        let habits = Array<Habit>();
        for (let habit of habitString.split(',')) {
            let habitInfo = habit.split(':');
            if (habitInfo.length === 3) {
                habits.push(new Habit(habitInfo[0], habitInfo[1] === 'true', habitInfo[2] === 'true'));
            }
        }
        return habits;
    }

    public habitsToString(habits: Array<Habit>) {
        let habitString = "";
        for (let habit of habits) {
            habitString += String(habit.name + ':' + habit.positive + ':' + habit.active + ',');
        }
        return habitString;
    }

    //only lists active habits
    public async listHabits() {
        let habits = Array<Habit>();
        const settings = await this.getSettings();
        habits = this.stringToHabits(settings.habits);
        for (let i = 0; i < habits.length; i++) {
            if (habits[i].active === false) {
                habits.splice(Number(i), 1);
            }
        }

        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    //lists all habits, including inactive ones
    public async listAllHabits() {
        let habits = Array<Habit>();
        const settings = await this.getSettings();
        habits = this.stringToHabits(settings.habits);
        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    //list moods entered in various entries, if not found returns a set of default moods as place holders
    public async listAllMoods() {
        let moods = Array<string>();
        let entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            if (entryLog[i].getMoods() !== "") {
                moods.push(entryLog[i].getMoods());
            }
        }
        if (moods.length > 0) {
            console.log("FS CLASS MOODS RETURNED: ", moods);
            return moods;
        }
        return Promise.resolve(['Happy', 'Sad', 'Excited', 'Calm']);
    }

    //set of stock habits for blank settings OR to ensure a return value
    private generateStockHabits() {
        let habits = Array<Habit>();
        habits.push(new Habit("Exercise", true, true));
        habits.push(new Habit("Meditate", true, true));
        habits.push(new Habit("Read", true, true));
        habits.push(new Habit("Study", true, true));
        habits.push(new Habit("Drink Alcohol", false, true));
        return habits;
    }

    //writes an entyr to the file, NULL return
    // will update entr if duplicate
    // init file -> check if file exist -> read file -> parse file -> check if entry exist -> update entry or create new one
    public async saveEntry(entry: Entry) {
        try {
            const file = await Filesystem.readFile({
                path: await this.filePath,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            const log: Array<Entry> = Array<Entry>();
            let existingData = Papa.parse(file.data as string, {
                delimiter: "@~~@DELIM@~~@",
                skipEmptyLines: true,
                header: true,
                error: (error: any) => {
                    console.error('Parse Error: ', error);
                },
                //check if date already exist and overwrite it if it does
                step: (pastEntry: any) => {
                    if (entry.date == pastEntry.date) {
                        //overwrite entry
                        pastEntry = entry;
                        console.log("DEBUG: OVERWITE ENTRY:", entry);
                        
                        log.push(pastEntry);
                    }
                }
            });

            let entryString = "\n" + entry.getDateEntry() + "@~~@DELIM@~~@" + entry.getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entry.getHabits()) + "@~~@DELIM@~~@" + entry.getTextEntry() + "\n";

            //writes entry to FS
            try {
                await Filesystem.appendFile({
                    path: await this.filePath,
                    directory: Directory.Data,
                    data: entryString,
                    encoding: Encoding.UTF8,
                });
                //reload the entryLog
                this.entryLog = this.loadFile();

            } catch (writeError) {
                console.log(writeError);
            }
        }
        catch (readError) {
            document.write("ERROR WRITING TO FS: ", String(readError));
        }
    }


    //retrieves the settings from the settings file, if it doesn't exist create it with default settings
    public async getSettings() {
        try {
            const file = await Filesystem.readFile({
                path: '/DATA/settings.json',
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            let settings = JSON.parse(file.data as string);
            console.log("SETTINGS: ", settings)
            return settings;

        } catch (readError) {
            let habits = this.generateStockHabits();
            let defaultSettings = {
                "entryFile": "/DATA/ENTRYLOG.csv",
                "dataBaseKey": "",
                "theme": "DARK",
                "habits": this.habitsToString(habits),
            };
            await Filesystem.writeFile({
                path: '/DATA/settings.json',
                directory: Directory.Data,
                data: JSON.stringify(defaultSettings, null, 2),
                encoding: Encoding.UTF8,
            });
            console.log("DEBUG: Settings file not found, creating new one with default settings");
            return defaultSettings;
        }
    }

    //update settings file, MINUS HABITS
    //setting is the setting to update, update is the string update
    //init currentSettings -> validate setting -> update setting -> write to file
    public async updateSettings(setting: string, update: string) {
        let currentConfig = await this.getSettings();
        //Sanitize input
        if (setting !== "habits" && !["entryFile", "dataBaseKey", "theme"].includes(setting)) {
            currentConfig[setting] = update;
        } else {
            console.log("Please do not use this for Habits, use habitControl()");
            return;
        }

        let newConfig = JSON.stringify(currentConfig, null, 2);

        await Filesystem.writeFile({
            path: '/DATA/settings.json',
            directory: Directory.Data,
            data: newConfig,
            encoding: Encoding.UTF8,
        }).catch((error) => {
            console.error('Error updating settings: ', error);
        })
    }

    //init habit (grab from json settings)
    //check and update habit
    //if habit exist update it
    //if habit does not exist create it
    //write to system
    public async habitControl(habitName: string, positive: boolean, active: boolean) {
        if (habitName === "") {
            console.log("Habit name cannot be empty");
            return;
        }
        let config = await this.getSettings();
        let habitList = this.stringToHabits(config.habits);

        let repeat = false;
        //update existing habit
        for (let habit of habitList) {
            if (habit.name === habitName) {
                habit.active = active;
                habit.positive = positive;
                config.habits = this.habitsToString(habitList);
                console.log("DEBUG: Habit updated: ", habit);
                repeat = true;
            }
        }
        // new habit
        if (repeat === false) {
            let newHabit = new Habit(habitName, positive, active);
            habitList.push(newHabit);
        }
        config.habits = this.habitsToString(habitList);

        //write habit to settings
        await Filesystem.writeFile({
            path: '/DATA/settings.json',
            directory: Directory.Data,
            data: JSON.stringify(config, null,),
            encoding: Encoding.UTF8,
        });
    }


    //TODO MAKE THIS TO Specifically focus on the settings file 
    private async updateHabitList(ar: string, habitname: string) {
        if (((ar != 'a') && (ar != 'd')) || habitname === "") {
            console.log("invalid option in updateHabitList");
            return;
        }
    }

    //different from deactivating habit
    //name is name of habit.name
    //finds habit -> removes from settings -> removes from entry log -> writes entry log
    public async removehabit(habitName: string) {
        let currentConfig = await this.getSettings();
        let habitList = this.stringToHabits(currentConfig.habits);
        let habExist = false;
        for (let i = 0; i < habitList.length; i++) {
            if (habitList[i].name === habitName) {
                habitList.splice(i, 1);
                currentConfig.habits = this.habitsToString(habitList);

                //write to settings.json
                await Filesystem.writeFile({
                    path: '/DATA/settings.json',
                    directory: Directory.Data,
                    data: JSON.stringify(currentConfig, null,),
                    encoding: Encoding.UTF8,
                });
                habExist = true;
            }
        }

        if (habExist === false) {
            console.log("HABIT NOT FOUND");
            return;
        }

        //remove from entryLog
        let entryLog = await this.entryLog;
        for (let i = 0; i < entryLog.length; i++) {
            let habits = entryLog[i].getHabits();
            for (let j = 0; j < habits.length; j++) {
                if (habits[j].name === habitName) {
                    let backUp = entryLog[i];
                    let habitEntry = backUp.getHabits();
                    habitEntry.splice(j, 1);
                }
            }
        }

        //write entryLog to file
        let entryString = "";
        for (let i = 0; i < entryLog.length; i++) {
            entryString += entryLog[i].getDateEntry() + "@~~@DELIM@~~@" + entryLog[i].getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entryLog[i].getHabits()) + "@~~@DELIM@~~@" + entryLog[i].getTextEntry() + "\n";
        }
        await Filesystem.appendFile({
            path: await this.filePath,
            directory: Directory.Data,
            data: entryString,
            encoding: Encoding.UTF8,
        }).catch((error) => {
            console.error('Error updating entry log: ', error);
        });

    }
}

/*
class syncToDB extends FileSystem{

}

 */
