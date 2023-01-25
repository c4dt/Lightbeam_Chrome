const lightbeam = {
    websites: {},
    //dataGatheredSince: null,
    //numFirstParties: 0,
    //numThirdParties: 0,

    async init() {

        this.websites = await store.getAll();
        this.websitesbackup = await store.getAll();
        //console.log("this websites",this.websites);
        //this.initTPToggle(); //api trackingProtectionMode not supported in chrome


        if (sessionStorage.getItem('refresh_once')) {
            console.log('location.reload();')
        } else {
            location.reload();
            sessionStorage.setItem('refresh_once', true);
        }

        this.renderGraph();
        this.addListeners();

        //this.updateVars(); //counting FP and TP number

    },


    /* async initTPToggle() {
       const toggleCheckbox
         = document.getElementById('tracking-protection-control');
       const trackingProtection = document.getElementById('tracking-protection');
       const trackingProtectionDisabled
         = document.getElementById('tracking-protection-disabled');
       if ('trackingProtectionMode' in chrome.privacy.websites) {
         trackingProtection.hidden = false;
         trackingProtectionDisabled.hidden = true;

         const trackingProtectionState
           = await chrome.privacy.websites.trackingProtectionMode.get({});
         let value = true;
         if (trackingProtectionState.value !== 'always') {
           value = false;
         }
         toggleCheckbox.checked = value;
         toggleCheckbox.addEventListener('change', () => {
           const value = toggleCheckbox.checked ? 'always' : 'private_browsing';
           chrome.privacy.websites.trackingProtectionMode.set({ value });
         });
       } else {
         trackingProtection.hidden = true;
         trackingProtectionDisabled.hidden = false;
       }
     },*/

    renderGraph() {
        const transformedData = this.transformData();
        viz.init(transformedData.nodes, transformedData.links);


    },

    addListeners() {
        this.downloadData();
        //this.downloadData1();
        //this.downloadCookie();
        //this.resetCookie();
        this.downloadCategory();
        this.resetData();
        //this.file();
        storeChild.onUpdate((data) => {
            this.redraw(data);
        });
    },

    // Called from init() (isFirstParty = undefined)
    // and redraw() (isFirstParty = true or false).
    /*async updateVars(isFirstParty) {

      // initialize dynamic vars from storage
      if (!this.dataGatheredSince) {
        const { dateStr, fullDateTime } = await this.getDataGatheredSince();
        if (!dateStr) {
          return;
        }
        this.dataGatheredSince = dateStr;
        const dataGatheredSinceElement
          = document.getElementById('data-gathered-since');
        dataGatheredSinceElement.textContent = this.dataGatheredSince || '';
        dataGatheredSinceElement.setAttribute('datetime', fullDateTime || '');
      }
      if (isFirstParty === undefined) {
        this.numFirstParties = await this.getNumFirstParties();
        this.setPartyVar('firstParty');
        this.numThirdParties = await this.getNumThirdParties();
        this.setPartyVar('thirdParty');
        return;
      }

      // update on redraw
      if (isFirstParty) {
        this.numFirstParties++;
        this.setPartyVar('firstParty');
      } else {
        this.numThirdParties++;
        this.setPartyVar('thirdParty');
      }
    },

    // Updates dynamic variable values in the page
    setPartyVar(party) {
      const numFirstPartiesElement = document.getElementById('num-first-parties');
      const numThirdPartiesElement = document.getElementById('num-third-parties');
      if (party === 'firstParty') {
        if (this.numFirstParties === 0) {
          numFirstPartiesElement.textContent = '';
        } else {
          numFirstPartiesElement.textContent = `${this.numFirstParties} Sites`;
        }
      } else if (this.numThirdParties === 0) {
        numThirdPartiesElement.textContent = '';
      } else {
        const str = `${this.numThirdParties} Third Party Sites`;
        numThirdPartiesElement.textContent = str;
      }
    },

    async getDataGatheredSince() {
      const firstRequestUnixTime = await storeChild.getFirstRequestTime();
      if (!firstRequestUnixTime) {
        return {};
      }
      // reformat unix time
      let fullDateTime = new Date(firstRequestUnixTime);
      let dateStr = fullDateTime.toDateString();
      // remove day of the week
      const dateArr = dateStr.split(' ');
      dateArr.shift();
      dateStr = dateArr.join(' ');
      // ISO string used for datetime attribute on <time>
      fullDateTime = fullDateTime.toISOString();
      return {
        dateStr,
        fullDateTime
      };
    },

    async getNumFirstParties() {
      return await storeChild.getNumFirstParties();
    },

    async getNumThirdParties() {
      return await storeChild.getNumThirdParties();
    },*/

    transformData() {
        const nodes = [];
        let links = [];
        for (const website in this.websites) {
            const site = this.websites[website];
            if (site.thirdParties) {
                const thirdPartyLinks = site.thirdParties.map((thirdParty) => {
                    return {
                        source: website,
                        target: thirdParty
                    };
                });
                links = links.concat(thirdPartyLinks);
            }
            nodes.push(this.websites[website]);
        }

        return {
            nodes,
            links
        };
    },

    /*
      downloadData()  {
        const saveData = document.getElementById('save-data-button');
        const outputdata = this.websitesbackup;
        function filterObj(obj, arr) {
            if (typeof (obj) !== "object" || !Array.isArray(arr)) {
                throw new Error("Wrong Format")
            }
            const result = {}
            Object.keys(obj).filter((key) => arr.includes(key)).forEach((key) => {
                result[key] = obj[key]
            })
            return result
        }

        require_keys = ['hostname', 'firstPartyHostnames', 'firstParty', 'thirdParties'];
        Downloaddata={};
        for (var n in outputdata) {
            ObjDown=outputdata[n];
            Downloaddata[n]=filterObj(outputdata[n],require_keys)

        }
        outputdata['__UUID']=store.transUUID();
        saveData.addEventListener('click', async () => {
            const blob = new Blob([JSON.stringify(outputdata,' ' , 2)],{type : 'application/json'});
            //var xhr = new XMLHttpRequest();
             //xhr.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/DeveloperTest/.receiveJSON.php", true);
             //xhr.send(JSON.stringify(outputdata,' ' , 2));
        var CurrentDate = (new Date(new Date().getTime())).toJSON().split('T')[0];
        localStorage["Data_Collection_Date"]=CurrentDate;
        const blob_download = new Blob([JSON.stringify(outputdata,' ' , 2)],
            {type : 'application/json'});
          const downloadurl = window.URL.createObjectURL(blob_download);
          const downloading = chrome.downloads.download({
            url : downloadurl,
            filename : 'ThunderbeamData.json',
            conflictAction : 'uniquify'
          });
          await downloading;

         document.getElementById('reset-data-button').style.backgroundColor='#194419';
         document.getElementById('reset-data-button').innerText='Reset Data (Recommended)';
        });


      },
      */
    downloadData() {
        const saveData = document.getElementById('save-data-button');
        const outputdata = this.websitesbackup;

        function filterObj(obj, arr) {
            if (typeof (obj) !== "object" || !Array.isArray(arr)) {
                throw new Error("Wrong Format")
            }
            const result = {}
            Object.keys(obj).filter((key) => arr.includes(key)).forEach((key) => {
                result[key] = obj[key]
            })
            return result
        }

        require_keys = ['hostname', 'firstPartyHostnames', 'firstParty', 'thirdParties'];
        Downloaddata = {};
        for (var n in outputdata) {
            ObjDown = outputdata[n];
            Downloaddata[n] = filterObj(outputdata[n], require_keys)

        }
        outputdata['__UUID'] = store.transUUID();
        saveData.addEventListener('click', async () => {
            //const blob = new Blob([JSON.stringify(outputdata,' ' , 2)],{type : 'application/json'});
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/cookie_LB/.receiveJSON.php", true);
            xhr.send(JSON.stringify(outputdata, ' ', 2));

            if (localStorage.getItem("DiffResult_Weekly") !== null) {
                const DifferDetaildata = JSON.parse(localStorage["DiffResult_Weekly"]);
                var tmp = {}
                tmp['__UUID'] = store.transUUID();
                DifferDetaildata.push(tmp);
                var xhrDiff = new XMLHttpRequest();
                xhrDiff.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/Differ_Details/.receiveJSON.php", true);
                xhrDiff.send(JSON.stringify(DifferDetaildata, ' ', 2));
                localStorage.removeItem("DiffResult_Weekly");
            }
            var CurrentDate = (new Date(new Date().getTime())).toJSON().split('T')[0];
            localStorage["Data_Collection_Date"] = CurrentDate;
            const blob_download = new Blob([JSON.stringify(Downloaddata, ' ', 2)],
                {type: 'application/json'});
            const downloadurl = window.URL.createObjectURL(blob_download);
            const downloading = chrome.downloads.download({
                url: downloadurl,
                filename: 'ThunderbeamData.json',
                conflictAction: 'uniquify'
            });
            await downloading;

            document.getElementById('reset-data-button').style.backgroundColor = '#194419';
            document.getElementById('reset-data-button').innerText = 'Reset Data (Recommended)';
        });


    },


    downloadCategory() {
        const saveData = document.getElementById('hash-button');
        saveData.addEventListener('click', async () => {
            const data = await store.countUrlCategories();
            const blob = new Blob([JSON.stringify(data, ' ', 2)],
                {type: 'application/json'});
            const url = window.URL.createObjectURL(blob);
            const downloading = chrome.downloads.download({
                url: url,
                filename: 'Categories.json',
                conflictAction: 'uniquify'
            });
            //await downloading;
            var categoryData = JSON.stringify(data)
            await alert("The category count: \n" + categoryData + ".");
        });
    },

    resetData() {
        const resetData = document.getElementById('reset-data-button');
        resetData.addEventListener('click', async () => {

            const msgBegin = 'Pressing OK will delete all data.';
            const msgEnd = 'Are you sure?';
            const confirmation = confirm(`${msgBegin + msgEnd}`);
            if (confirmation) {

                await storeChild.reset();
                window.location.reload();
            }

        });
    },

    redraw(data) {
        if (!(data.hostname in this.websites)) {
            this.websites[data.hostname] = data;
            //this.updateVars(data.firstParty);
        }
        if (data.firstPartyHostnames) {
            // if we have the first parties make the link if they don't exist
            data.firstPartyHostnames.forEach((firstPartyHostname) => {
                if (this.websites[firstPartyHostname]) {
                    const firstPartyWebsite = this.websites[firstPartyHostname];
                    if (!('thirdParties' in firstPartyWebsite)) {
                        firstPartyWebsite.thirdParties = [];
                        firstPartyWebsite.firstParty = true;
                    }
                    if (!(firstPartyWebsite.thirdParties.includes(data.hostname))) {
                        firstPartyWebsite.thirdParties.push(data.hostname);
                    }
                }
            });
        }
        const transformedData = this.transformData(this.websites);
        viz.draw(transformedData.nodes, transformedData.links);
    }
};
window.onload = () => {
    lightbeam.init();
};
      
