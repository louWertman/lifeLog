/*
Authors: Lou Wertman,
Purpose: Functions related to syncing to the local file or the database and any entry retrieval functions
*/

import React from 'react';

import { useCSVReader } from 'react-papaparse';
const mysql = require('mysql');
import * as fs from 'fs';
// for cross platform compatibility: https://capacitorjs.com/docs/apis/filesystem
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

import { Entry, Habit } from './entity';
import { Entrypoints } from 'next/dist/build/swc/types';
import path from 'path';

export class fileSystem {
    //constructor
    public constructor(public filePath: string) {
        this.filePath = filePath;
    }

    //variables
    private entryLog: Promise<Entry[]> = this.loadFile(this.filePath);

    //functions

    //load and parse a file for the entryLog object
    async loadFile(filePath: string) {
        const { CSVReader } = useCSVReader();

        //if the file exists create it
        try {
            await Filesystem.readFile({
                path: filePath,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
        } catch (readError) {
            await Filesystem.writeFile({
                path: filePath,
                directory: Directory.Data,
                data: 'DATE@~~@DELIM@~~@MOOD@~~@DELIM@~~@HABITS@~~@DELIM@~~@ENTRY\n',
                encoding: Encoding.UTF8,
            });
        }

        let file = await Filesystem.readFile({
            path: filePath,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });

        let entries = Array<Entry>();

        CSVReader.parse(file.data, {
            delimiter: "@~~@DELIM@~~@",
            skipEmptyLines: true,
            header: true,
            error: (error: any) => {
                console.error('Parse Error: ', error);
            },
            step: (entry: any) => {
                let newEntry = new Entry(entry.data['date'], entry.data['mood'], this.stringToHabits(entry.data['habits']), entry.data['entry']);
                entries.push(newEntry);
            }
        });

        return entries;
    }


    //returns a string array with the date of every entry
    async listEntries() {
        let dates = Array<string>();
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            dates.push(entryLog[i].getDateEntry())
        }
        return dates;
    }
    //finds an entry with a date, returns an Entry object
    async fetchEntry(date: string) {
        const entryLog = await this.entryLog;
        for (let i = entryLog.length - 1; i >= 0; i--) {
            if (entryLog[i].getDateEntry() === date) {
                return entryLog[i];
            }
        }
        return null;
    }

    private stringToHabits(habitString: string) {
        let habits = Array<Habit>();
        for (let habit of habitString.split(',')) {
            let habitInfo = habit.split(':');
            if (habitInfo.length === 3) {
                habits.push(new Habit(habitInfo[0], habitInfo[1] === 'true', habitInfo[2] === 'true'));
            }
        }
        return habits;
    }

    private habitsToString(habits: Array<Habit>) {
        let habitString = "";
        for (let habit of habits) {
            habitString += String(habit.name + ':' + habit.positive + ':' + habit.active + ',');
        }
        return habitString;
    }

    //writes an entyr to the file, NULL return
    writeEntryToFile(entry: Entry) {
        let entryString = entry.getDateEntry() + "@~~@DELIM@~~@" + entry.getMoods() + "@~~@DELIM@~~@" + this.habitsToString(entry.getHabits()) + "@~~@DELIM@~~@" + entry.getTextEntry() + "\n";
        fs.appendFileSync(this.filePath, entryString);
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

    public async updateSettings(setting:string, update:string){
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