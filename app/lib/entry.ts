/*
Authors: Lou Wertman,
Purpose: An object that stores data regarding entries. Stores the date, mood, habits, and entry log. Other relevant objects can be stored here
*/


class Entry {
    public constructor (public date: string) {
        this.date = date;
    }

    moods: Array<string>;
    habits: Array<string>;
    textEntry: string;

}