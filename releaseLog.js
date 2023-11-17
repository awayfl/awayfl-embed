import { execFile } from 'child_process';

function invoke(file = '', args = [], options) {
    return new Promise((res, rej) => {
        execFile(file, args, options, (err, out, steerr) => {
            if (err) {
                rej(err);
            }
            
            if (steerr) {
                rej(steerr);
            }

            res(out);
        });
    });
}

function collectPreviouTagAfterHead (repoUrls = []) {
    const req = repoUrls.map(({url}) => {
        return invoke(
            'git', 
            ['tag', '--sort=-taggerdate'],
            { cwd: url, windowsHide: true }
        ).then((list) => {
            const tags = list.split('\n').filter(Boolean);
            return tags[1] || tags[0];
        });
    });

    return Promise.all(req);
}

function collectLastTags (repoUrls = []) {
    const req = repoUrls.map(({url}) => {
        return invoke(
            'git', 
            ['describe', '--abbrev=0', '--tags'],
            { cwd: url, windowsHide: true }
        ).then((e) => e.trim());
    });

    return Promise.all(req);
}

function collectCommits (repoUrls = [], endTags = []) {
    const req = repoUrls.map(({url}, i) => {
        return invoke(
            'git', 
            ['log', '--pretty=format:"%cd; %s"','--date=short', '--' ,`HEAD...${endTags[i].trim()}`],
            { cwd: url, windowsHide: true }
        ).then(h => h.split('\n').filter(Boolean).map((l) => l.substring(1, l.length - 1)));
    });

    return Promise.all(req);
}


export async function releaseLog (reposList = [], endTags = []) {
    if (!endTags || endTags.length === 0) {
        endTags = await collectPreviouTagAfterHead(reposList);
    }

    const currentTags = await collectLastTags(reposList);
    const history = await collectCommits(reposList, endTags);
    
    return reposList.map((e, i) => ({
        currentTag: currentTags[i],
        endTag: endTags[i].trim(), 
        commits: history[i],
        url: e.url,
        name: e.name
    }));
}
