/*
Authors: Lou Wertman,
Purpose: Functions related to syncing to the local file or the database and any entry retrieval functions
*/

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
                    const habitString = entry.data['habits'] || ""; // Default to an empty string if undefined
                    let newEntry = new Entry(
                        entry.data['DATE'],
                        entry.data['Mood'],
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
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            for (let j = 0; j < entryLog[i].getHabits().length; j++) {
                let habit = entryLog[i].getHabits()[j];
                habit.active ? habits.push(entryLog[i].getHabits()[j]) : null;;
            }
        }
        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    public async listAllHabits() {
        let habits = Array<Habit>();
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            for (let j = 0; j < entryLog[i].getHabits().length; j++) {
                habits.push(entryLog[i].getHabits()[j]);
            }
        }
        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    //later pull from settings object
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
    //TODO: check for duplicate entries
    public async saveEntry(entry: Entry) {
        try {
            const file = await Filesystem.readFile({
                path: await this.filePath,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            let existingData = Papa.parse(file.data as string, {
                delimiter: "@~~@DELIM@~~@",
                skipEmptyLines: true,
                header: true,
                error: (error: any) => {
                    console.error('Parse Error: ', error);
                },
                //check if date already exist
                step: (pastEntry: any) => {
                    if (entry.date == pastEntry.date) {
                        pastEntry.textEntry += entry.textEntry;
                        pastEntry.mood = entry.mood;
                        pastEntry.habits = entry.habits;
                        entry = pastEntry;
                    }
                    console.log(entry);
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


    //retrieves the settings from the settings.json file, if it doesn't exist create it with default settings
    public async getSettings() {
        try {
            const file = await Filesystem.readFile({
                path: '/DATA/settings.json',
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            let settings = JSON.parse(file.data as string);
            return settings;
        } catch (readError) {
            let settings, defaultSettings = {
                "entryFile": "/DATA/ENTRYLOG.csv",
                "dataBaseKey": "", // pull from .env file, for Dyllan
                "theme": "DARK"
            };
            await Filesystem.writeFile({
                path: '/DATA/settings.json',
                directory: Directory.Data,
                data: JSON.stringify(defaultSettings, null, 2),
                encoding: Encoding.UTF8,
            });
            return settings;
        }
    }

    public async updateSettings(setting: string, update: string) {
        let currentConfig = await this.getSettings();
        currentConfig[setting] = update;

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
}

/*
class syncToDB extends FileSystem{

}

 */
