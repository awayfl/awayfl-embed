export class Reporter {
    value: number = 0;

    constructor(
        public callback?: (p: number) => void, 
        public childs?: Reporter[], 
        public weight: number = 1) {

        this.childs = this.childs?.slice();
        this._report = this._report.bind(this);
    }

    _report (v: number) {
        if (!this.childs) {
            this.value = v * this.weight;
        } else {
            let summ = 0;
            let v = 0;

            this.childs.forEach((e) => {
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
