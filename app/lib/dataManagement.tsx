/*
Authors: Lou Wertman,Dyllan Burgos
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
    public entryLog: Promise<Entry[]> = this.filePath.then(filePath => this.loadFile());

    //permissions checks
    private getPermissions = async () => {
        const currPermissions = await Filesystem.checkPermissions();
        if (currPermissions.publicStorage === 'denied') {
            const requestPermissions = await Filesystem.requestPermissions();
            if (requestPermissions.publicStorage === 'denied') {
            } else {
            }
        } else {
        }
    }

    constructor() {

        this.getPermissions();

        this.entryLog = this.filePath.then(filePath => this.loadFile());
        this.filePath = this.getSettings().then(settings => settings['entryFile']);
    }

    //load and parse a file for the entryLog object
    public async loadFile() {
        await new Promise(resolve => setTimeout(resolve, 0));
        //if the file exists create it
        try {
            await Filesystem.readFile({
                path: await this.filePath,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });
        } catch (readError) {
            await Filesystem.writeFile({
                path: await this.filePath,
                directory: Directory.Documents,
                data: 'DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY',
                encoding: Encoding.UTF8,
            });
        }

        let file = await Filesystem.readFile({
            path: await this.filePath,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

        let entries = Array<Entry>();

        Papa.parse(file.data as string, {
            delimiter: "@~~@DELIM@~~@",
            skipEmptyLines: true,
            header: true,
            error: (error: any) => {
                //console.error('Parse Error: ', error);
            },
            step: (entry: any) => {
                if (entry && entry.data) {
                    const habitString = typeof entry.data['HABITS'] === 'string' ? entry.data['HABITS'] : "";

                    let newEntry = new Entry(
                        entry.data['DATE'],
                        entry.data['MOOD'],
                        this.stringToHabits(habitString),
                        entry.data['ENTRY']
                    );
                    entries.push(newEntry);
                } else {
                    //console.error("Invalid entry data: ", entry);
                }
            }
        });

        return entries;
    }


    //returns a string array with the date of every entry, latest entry first
    public async listEntries() {
        await new Promise(resolve => setTimeout(resolve, 0));
        const entryLog = await this.entryLog;
        return entryLog
            .sort((a, b) => new Date(b.getDateEntry()).getTime() - new Date(a.getDateEntry()).getTime())
            .map((entry) => ({
                date: entry.getDateEntry(),
                content: entry.getTextEntry(),
                habits: entry.getHabits(),
                mood: entry.getMoods(),
            }));
    }
    //finds an entry with a date, returns an Entry object
    public async fetchEntry(date: string) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            if (entryLog[i].getDateEntry() === date) {
                return entryLog[i];
            }
        }
        return null;
    }

    public stringToHabits(habitString: string) {
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


    //lists all habits, including inactive ones and non removal of duplicates
    public async listAllHabits() {
        let habits = Array<Habit>();
        const settings = await this.getSettings();
        habits = this.stringToHabits(settings.habits);
        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    //lists all habits, including inactive ones and non removal of duplicates, for the statistics class
    public async habitArrStatistics() {
        let habits = Array<Habit>();
        const entryLog = await this.entryLog;
        for (let entry of entryLog) {
            let grabbedHabits = entry.getHabits();
            habits.push(...grabbedHabits);
        }
        if (habits.length > 0) {
            return habits;
        }
        return this.generateStockHabits();
    }

    //normalize capaital first letter of the mood
    private normalizeMoods(str: string) {
        if (str.length === 0) {
            return "";
        }
        return (str.trim().charAt(0).toUpperCase() + str.slice(1));
    }

    //list moods entered in various entries, if not found returns a set of default moods as place holders
    public async listAllMoods() {
        let moods = Array<string>();
        let entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            if (entryLog[i].getMoods() !== "") {
                let mood = this.normalizeMoods(entryLog[i].mood);
                moods.push(mood);
            }
        }
        if (moods.length > 0) {
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
        //load file
        const log = await this.entryLog;
        const config = await this.getSettings();
        await new Promise(resolve => setTimeout(resolve, 0));

        let entryString = "";
        //check if entry already exists if does overwirite it
        for (let i = 0; i < log.length; i++) {
            if (log[i].date === entry.date) {
                log[i] = entry;
                entryString += "DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY";
                //convert back into csv entryString
                for (let j = 0; j < log.length; j++) {
                    entryString += "\n" + log[j].getDateEntry() + "@~~@DELIM@~~@" + log[j].getMoods() + "@~~@DELIM@~~@" + this.habitsToString(log[j].getHabits()) + "@~~@DELIM@~~@" + log[j].getTextEntry();
                }
                try {
                    await Filesystem.writeFile({
                        path: await this.filePath,
                        directory: Directory.Documents,
                        data: entryString,
                        encoding: Encoding.UTF8,
                    });
                    if (config.sync === "1"){ //&& config.dbKey) {
                        try {
                            console.log("Sending entry:", {
                                date: entry.getDateEntry(),
                                mood: entry.getMoods(),
                                content: entry.getTextEntry(),
                                habits: this.habitsToString(entry.getHabits()),
                                token: config.dbKey
                              });
                          await fetch('/api/entries/insert', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              date: entry.getDateEntry(),
                              mood: entry.getMoods(),
                              content: entry.getTextEntry(),
                              habits: this.habitsToString(entry.getHabits()),
                              token: config.dbKey
                            })
                          });
                            console.log("DEBUG: Entry synced to DB.");
                        } catch (err) {
                            console.error("ERROR: Failed to sync entry to backend", err);
                        }
                    }
                } catch (readError) {
                    //console.error("Error writing to file: ", readError);
                }
                
                return;
                
            }
        }
        //otherwise append file
        entryString += "\n" + entry.getDateEntry() + "@~~@DELIM@~~@" + entry.getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entry.getHabits()) + "@~~@DELIM@~~@" + entry.getTextEntry();
        //writes entry to FS
        try {
            await Filesystem.appendFile({
                path: await this.filePath,
                directory: Directory.Documents,
                data: entryString,
                encoding: Encoding.UTF8,
            });
            //reload the entryLog
            this.entryLog = this.loadFile();

        } catch (writeError) {
            //console.error(writeError);
        }
    }

    public async deleteEntry(date: string) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const entryLog = await this.entryLog;
        const config = await this.getSettings();
    
        // Remove from local entryLog array
        for (let i = 0; i < entryLog.length; i++) {
            if (entryLog[i].getDateEntry() === date) {
                entryLog.splice(i, 1);
                break;
            }
        }
    
        // Rewrite CSV with updated log
        let entryString = "DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY\n";
        for (let i = 0; i < entryLog.length; i++) {
            entryString += entryLog[i].getDateEntry() + "@~~@DELIM@~~@" +
                entryLog[i].getMoods() + "@~~@DELIM@~~@" +
                this.habitsToString(entryLog[i].getHabits()) + "@~~@DELIM@~~@" +
                entryLog[i].getTextEntry() + "\n";
        }
    
        await Filesystem.writeFile({
            path: await this.filePath,
            directory: Directory.Documents,
            data: entryString,
            encoding: Encoding.UTF8,
        }).catch((error) => {
            // console.error('Error updating entry log: ', error);
        });
    
        // Reload entryLog
        this.entryLog = this.loadFile();
    
        // 🔁 Sync with database
        if (config.sync === "1" && config.dbKey) {
            try {
                await fetch('/api/entries/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: date,
                        token: config.dbKey
                    }),
                });
                console.log(`Entry on ${date} deleted from DB.`);
            } catch (err) {
                console.error(`Failed to delete DB entry on ${date}:`, err);
            }
        }
    }
    
    //retrieves the settings from the settings file, if it doesn't exist create it with default settings
    public async getSettings() {

    if (typeof window === 'undefined') {
        return {
            entryFile: 'ENTRYLOG.csv',
            dbKey: '',
            theme: 'DARK',
            habits: this.habitsToString(this.generateStockHabits()),
        };
    }


    try {
        const file = await Filesystem.readFile({
            path: 'settings.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        let settings = JSON.parse(file.data as string);
        return settings;

    } catch (readError) {
        let habits = this.generateStockHabits();
        let defaultSettings = {
            "entryFile": "ENTRYLOG.csv",
            "dbKey": "",
            "sync": 0,
            "theme": "DARK",
            "habits": this.habitsToString(habits),
        };
        await Filesystem.writeFile({
            path: 'settings.json',
            directory: Directory.Documents,
            data: JSON.stringify(defaultSettings, null, 2),
            encoding: Encoding.UTF8,
        });
        return defaultSettings;
    }
}


    //update settings file, MINUS HABITS
    //setting is the setting to update, update is the string update
    //init currentSettings -> validate setting -> update setting -> write to file
    public async updateSettings(setting: string, update: string) {
        // block updating 'habits' directly
        if (setting === "habits") return;
      
        let currentConfig = await this.getSettings();
        currentConfig[setting] = update;
      
        const newConfig = JSON.stringify(currentConfig, null, 2);
      
        try {
          await Filesystem.writeFile({
            path: 'settings.json',
            directory: Directory.Documents,
            data: newConfig,
            encoding: Encoding.UTF8,
          });
        } catch (error) {
          console.error('Error updating settings:', error);
        }
    }


    //init habit (grab from json settings)
    //check and update habit
    //if habit exist update it
    //if habit does not exist create it
    //write to system
    public async habitControl(habitName: string, positive: boolean, active: boolean) {
    if (habitName === "") {
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
            repeat = true;
        }
        //update entries with updated habit
        let entryLog = await this.entryLog;
        for (let i = 0; i < entryLog.length; i++) {
            let habits = entryLog[i].getHabits();
            for (let j = 0; j < habits.length; j++) {
                if (habits[j].name === habitName) {
                    habits[j].active = active;
                    habits[j].positive = positive;
                }
            }
            let entryString = "DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY\n";
            for (let i = 0; i < entryLog.length; i++) {
                entryString += entryLog[i].getDateEntry() + "@~~@DELIM@~~@" + entryLog[i].getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entryLog[i].getHabits()) + "@~~@DELIM@~~@" + entryLog[i].getTextEntry() + "\n";
            }
            await Filesystem.writeFile({
                path: await this.filePath,
                directory: Directory.Documents,
                data: entryString,
                encoding: Encoding.UTF8,
            }).catch((error) => {   
                //console.error('Error updating entry log: ', error);
            });

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
        path: 'settings.json',
        directory: Directory.Documents,
        data: JSON.stringify(config, null,),
        encoding: Encoding.UTF8,
    });
    if (config.sync === "1" && config.dbKey) {
        try {
            await fetch('/api/habits/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitName,
                    positive,
                    active,
                    token: config.dbKey
                }),
            });
            console.log("DEBUG: Habit synced to DB.");
        } catch (err) {
            console.error("ERROR syncing habit:", err);
        }
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
                path: 'settings.json',
                directory: Directory.Documents,
                data: JSON.stringify(currentConfig, null,),
                encoding: Encoding.UTF8,
            });
            if (currentConfig.sync === "1" && currentConfig.dbKey) {
                try {
                    await fetch('/api/habits/delete', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ habitName, token: currentConfig.dbKey }),
                    });
                    console.log("DEBUG: Habit deleted from DB.");
                } catch (err) {
                    console.error("ERROR deleting from DB:", err);
                }
            }
            habExist = true;
        }
    }

    if (habExist === false) {
        return;
    }

    //remove from entryLog
    await new Promise(resolve => setTimeout(resolve, 0));
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
    let entryString = "DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY\n";
    for (let i = 0; i < entryLog.length; i++) {
        entryString += entryLog[i].getDateEntry() + "@~~@DELIM@~~@" + entryLog[i].getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entryLog[i].getHabits()) + "@~~@DELIM@~~@" + entryLog[i].getTextEntry() + "\n";
    }
    await Filesystem.writeFile({
        path: await this.filePath,
        directory: Directory.Documents,
        data: entryString,
        encoding: Encoding.UTF8,
    }).catch((error) => {
        //console.error('Error updating entry log: ', error);
    });

}
/**
 * Author: Dyllan Burgos  
 * Professor: Charlie Shim  
 * Function: syncAllPastHabitsToDB  
 * Purpose: Syncs all locally stored habits from settings.json to the remote database
 *          using the /api/habits/update POST endpoint.
 *
 * returns Nothing. Errors are logged to console if syncing fails.
 */
public async syncAllPastHabitsToDB() {
    const config = await this.getSettings();
    if (config.sync !== "1" || !config.dbKey) return;

    const allHabits = await this.listAllHabits();
    for (const habit of allHabits) {
        try {
            await fetch('/api/habits/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitName: habit.name,
                    active: habit.active,
                    positive: habit.positive,
                    token: config.dbKey
                })
            });
        } catch (err) {
            console.error(`Failed to sync habit '${habit.name}'`, err);
        }
    }
}

/**
 * Author: Dyllan Burgos  
 * Professor: Charlie Shim  
 * Function: syncAllEntriesToDB  
 * Purpose: Syncs all locally stored journal entries to the remote database
 *          using the /api/entries/insert POST endpoint.
 *
 * returns  Nothing. Errors are logged to console if syncing fails.
 */
public async syncAllEntriesToDB() {
    const config = await this.getSettings();
    if (config.sync !== "1" || !config.dbKey) return;

    const entries = await this.entryLog;
    for (const entry of entries) {
        try {
            await fetch('/api/entries/insert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: entry.getDateEntry(),
                    mood: entry.getMoods(),
                    content: entry.getTextEntry(),
                    habits: this.habitsToString(entry.getHabits()),
                    token: config.dbKey
                })
            });
        } catch (err) {
            console.error(`Failed to sync entry for date '${entry.getDateEntry()}'`, err);
        }
    }
}
    /**
     * Fetches all entries, habits, and moods from the database using the sync token.
     * Synchronizes the local CSV with the fetched data.
     */
public async fetchAndSyncFromDB(token: string) {
    try {
        const response = await fetch('/api/entries/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!response.ok) {
            console.error("Failed to fetch entries from DB");
            return;
        }

        const data = await response.json();
        if (!data.success) {
            console.error("Failed to fetch: ", data.error);
            return;
        }

        console.log("Fetched Entries from DB:", data.entries);

        // Clear the current local CSV and re-populate
        let entryString = "DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY\n";
        
        for (const entry of data.entries) {
            const habitString = entry.habits.map((habit: any) =>
                `${habit.name}:${habit.positive}:${habit.active}`
            ).join(",");

            entryString += `${entry.date}@~~@DELIM@~~@${entry.mood}@~~@DELIM@~~@${habitString}@~~@DELIM@~~@${entry.content}\n`;
        }

        await Filesystem.writeFile({
            path: await this.filePath,
            directory: Directory.Documents,
            data: entryString,
            encoding: Encoding.UTF8,
        });

        console.log("Local CSV updated successfully.");
        this.entryLog = this.loadFile();

    } catch (err) {
        console.error("Error syncing from DB:", err);
    }
}

}

/*
class syncToDB extends FileSystem{

}

 */
