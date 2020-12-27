export class Reporter {
    static ID = 0;
    id = Reporter.ID++;
    value: number = 0;
    _childs: Reporter[] = [];

    constructor(
        public callback?: (p: number) => void, 
        _childs?: Reporter[], 
        public weight: number = 1) {

        this._report = this._report.bind(this);

        this.childs = _childs;
    }

    set childs(chs: Reporter[]) {

        for(let old of this._childs) {
            if(old.callback === this._report)
            {
                old.callback = null;
            }
        }

        this._childs.length = 0;
    
        if(chs) {
            for(let c of chs) {
                if (c === this)
                    throw 'Reporter loop';

                c.callback = this._report;
            }

            this._childs = chs.slice();
        }
    }

    get childs() {
        return this._childs;
    }

    _report (v: number) {
        if (this._childs.length === 0) {
            this.value = v * this.weight;
        } else {
            let summ = 0;
            let v = 0;

            this._childs.forEach((e) => {
                summ += e.weight || 1;
                v += (e.value || 0);
            });

            this.value = v / summ;
        }

        this.callback && this.callback(this.value);
    }

    get report() {
        return this._report;
    }
}
