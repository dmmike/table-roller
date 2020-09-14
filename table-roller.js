class Table {
    constructor(entries, title) {
        this.entries = entries;
        this.title = title;
    }

    roll() { throw new Error('Could not access value getter of entry type'); };
}

export class SimpleTable extends Table {
    constructor(entries, title = '') {
        if (!Array.isArray(entries)) throw new Error('Entries for simple table should be array of non-weighted entries, strings, or numbers');
        entries.forEach((entry, index) => {
            if (!(entry instanceof Entry)) {
                entries[index] = new SimpleEntry(entry);
            }
        })
        super(entries, title);
    }

    roll() {
        let roll = Math.ceil(Math.random() * this.entries.length);
        let result = this.entries[roll - 1];
        return result.getValue();
    }
}

export class WeightedTable extends Table {
    constructor(entries, title = '') {
        if (!Array.isArray(entries)) throw new Error('Entries for weighted table should be array of (weighted) entries');
        entries.forEach((entry, index) => {
            if (!(entry instanceof WeightedEntry)) entries[index] = new WeightedEntry(1, entry);
        })

        super(entries, title);
    }

    get totalWeight() {
        return this.entries.reduce((totalWeight, entry) => totalWeight + entry.weight, 0)
    }

    roll() {
        let weightedRoll = Math.ceil(Math.random() * this.totalWeight);
        let result;
        for (let i = 0; !result && i < this.entries.length; i++) {
            if (weightedRoll <= this.entries[i].weight) {
                result = this.entries[i].entry;
            }
            else {
                weightedRoll -= this.entries[i].weight;
            }
        }
        return result.getValue();
    }
}

class Entry {
    constructor(entry) {
        this.entry = entry;
        this.isSimple = true;
    }

    getValue() { throw new Error('Could not access value getter of entry type'); }
}

export class MultiEntry extends Entry {
    constructor(entries) {
        if (!Array.isArray(entries) || entries.some(entry => entry instanceof Entry)) throw new Error('MultiEntry needs to be an array of entries');
        super(entries);
    }
}

export class SimpleEntry extends Entry {
    constructor(entry, doNotParse = false) {
        super(entry);

        this.doNotParse = doNotParse;
    }

    getValue() { return this.entry };
}

export class FollowupTableEntry extends Entry {
    constructor(entry) {
        if (!(entry instanceof Table)) throw new Error('FollowupTableEntry needs to be a Table');
        super(entry);
    }

    getValue() { return this.entry.roll(); }
}

export class WeightedEntry extends Entry {
    constructor(weight, entry) {
        if (!Number.parseInt(weight)) throw new Error('Weight of table entry needs to be a number higher than 0');
        if (!(entry instanceof Entry)) {
            entry = new SimpleEntry(entry);
        }

        super(entry);

        this.weight = weight;

        this.isSimple = false;
    }

    getValue() { return this.entry.getValue(); }
}