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
   
  
	
	if (sessionStorage.getItem('refresh_once')){
		console.log('location.reload();')
	}else{
	location.reload();
	sessionStorage.setItem('refresh_once', true);
	}
	
	
	
	if (localStorage.getItem("notification-push") === null) {
		document.querySelector("[class='notify']").style.display='';
		var notify = document.getElementById("mynotify");

		// Get the image and insert it inside the notify - use its "alt" text as a caption
		var img = document.getElementById("interface_notify");
		var notifyImg = document.getElementById("img01");
		var captionText = document.getElementById("caption");
		img.onclick = function(){
		  notify.style.display = "block";
		  notifyImg.src = this.src;
		  //captionText.innerHTML = this.alt;
		  captionText.innerHTML ="New protection tool interface";
		}

		// Get the <span> element that closes the notify
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on <span> (x), close the notify
		span.onclick = function() { 
		  notify.style.display = "none";
		}

		var notifyconfirm_btn=document.querySelector("[class='notify-confirm']");

			notifyconfirm_btn.addEventListener('click', async () => {
					localStorage['notification-push']='done';
				  chrome.tabs.create({url:"https://chrome.google.com/webstore/detail/rachels-gdpr-consent-mana/omjhcekkahgmgnnhgljhljocnfdbeelp"});
				});
				
		var notifycancel_btn=document.querySelector("[class='notify-cancel']");
		
			notifycancel_btn.addEventListener('click', async () => {
					localStorage['notification-push']='done';
					document.querySelector("[class='notify']").style.display='none'
				});
	}
	
	
	

	if (localStorage.getItem("consent-notice-user") === null) {
		
	document.getElementsByClassName("modal")[0].style.display="";
	var confirm_btn=document.querySelector("body > main > div > div.modal-footer > button.modal-confirm");

	    confirm_btn.addEventListener('click', async () => {
			//console.log("confirm_btn")
			  localStorage['consent-notice-user']=true;
			  document.getElementById('auto-collection-control').checked=true;
			  localStorage['auto-collection-control']=true;
			  document.querySelector("body > main > div ").style.display='none'
			  this.renderGraph();
			});
			
	var cancel_btn=document.querySelector("body > main > div > div.modal-footer > button.modal-cancel");
	
	    cancel_btn.addEventListener('click', async () => {
			//console.log("cancel_btn")
			 localStorage['consent-notice-user']=false;
			 document.querySelector("body > main > div ").style.display='none'
			 document.getElementById('auto-collection-control').checked=false;
			 localStorage['auto-collection-control']=false;
			 //localStorage.removeItem("consent-notice-user");
			 this.renderGraph();
			});
	}
	else{
		this.renderGraph();
		this.addListeners();
	}
	
    //this.updateVars(); //counting FP and TP number
	
	
	if (document.getElementById('auto-collection-control').checked == true) {
		if (store.isCollectDate()){
			document.getElementById('send-data-button').click();
		}
	}
	
	
	
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
	this.sendData();
    //this.downloadData1();
    //this.downloadCookie();
	//this.resetCookie();
	this.downloadCategory();
    this.resetData();
	//this.file();
	this.mailsome1();
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
        //const blob = new Blob([JSON.stringify(outputdata,' ' , 2)],{type : 'application/json'});
		var xhr = new XMLHttpRequest(); 
		xhr.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/cookie_LB/.receiveJSON.php", true);
		 xhr.send(JSON.stringify(outputdata,' ' , 2));

		if (localStorage.getItem("DiffResult_Weekly") !== null) {
		  const DifferDetaildata = JSON.parse(localStorage["DiffResult_Weekly"]);
		var tmp = {}
		tmp['__UUID']=store.transUUID();
		DifferDetaildata.push(tmp);
		 var xhrDiff = new XMLHttpRequest(); 
		 xhrDiff.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/Differ_Details/.receiveJSON.php", true);
		 xhrDiff.send(JSON.stringify(DifferDetaildata,' ' , 2));
		  localStorage.removeItem("DiffResult_Weekly"); 
	  }
	var CurrentDate = (new Date(new Date().getTime())).toJSON().split('T')[0];
	localStorage["Data_Collection_Date"]=CurrentDate;
	const blob_download = new Blob([JSON.stringify(Downloaddata,' ' , 2)], 
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
  

  
  downloadCategory() {
    const saveData = document.getElementById('hash-button');
    saveData.addEventListener('click', async () => {
      const data = await store.countUrlCategories();
      const blob = new Blob([JSON.stringify(data ,' ' , 2)],
        {type : 'application/json'});
      const url = window.URL.createObjectURL(blob);
      const downloading = chrome.downloads.download({
        url : url,
        filename : 'Categories.json',
        conflictAction : 'uniquify'
      });
      //await downloading;
	  var categoryData=JSON.stringify(data)
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
  
  
    sendData() {
	const outputdata = this.websitesbackup;
	outputdata['__UUID']=store.transUUID();

			  
	
    const sendData = document.getElementById('send-data-button');
	
    sendData.addEventListener('click', async () => {
	  var xhr = new XMLHttpRequest(); 
	 xhr.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/cookie_LB/.receiveJSON.php", true);
	 xhr.send(JSON.stringify(outputdata,' ' , 2));
	  if (localStorage.getItem("DiffResult_Weekly") !== null) {
		  const DifferDetaildata = JSON.parse(localStorage["DiffResult_Weekly"]);
			var tmp = {}
			tmp['__UUID']=store.transUUID();
			DifferDetaildata.push(tmp);
		  var xhrDiff = new XMLHttpRequest(); 
		 xhrDiff.open("POST", "https://nms.kcl.ac.uk/netsys/projects/tracking-the-trackers/Differ_Details/.receiveJSON.php", true);
		  xhrDiff.send(JSON.stringify(DifferDetaildata,' ' , 2));
		  localStorage.removeItem("DiffResult_Weekly"); 
	  }
	  var CurrentDate = (new Date(new Date().getTime())).toJSON().split('T')[0];
	  localStorage["Data_Collection_Date"]=CurrentDate;
	  
	  if ((localStorage.getItem("consent-notice-user") === null)||(localStorage['auto-collection-control']=='false')) {
		
		//const msgBegin = 'If you consent voluntarily to be a participant in this study and understand that:\n * no Personal Information will be collected, and we cannot in anyway identify our specific users (collection will be kept anonymous). \n * This data collection will be only used for the research study and publication (analyse the extent of third-party risk across countries), excluding any profitable activities \n * you can use the toggle switch to opt out/withdraw from the study at any time, without having to give a reason \n* All information will be handled in accordance with the terms of the Research Ethics Committee of King\'s College London and the General Data Protection Regulation (GDPR).)';
		const msgBegin = 'This extension is developed as part of a large study of web tracking. \n * We wish to collect your data anonymously to help understand tracking around the world. If you agree, please press OK below. \n * If you press NO, then your data will NOT be collected, but you will still be able to use our extension. \n * You can change your mind at any time by simply changing the auto data collect setting on the left.';
		const msgEnd = ' ';
	  
		const confirmation = confirm(`${msgBegin + msgEnd}`);
		if (confirmation) {
			localStorage['consent-notice-user']=true;
			document.getElementById('auto-collection-control').checked=true;
			 localStorage['auto-collection-control']=true;
			//not turn to research ethics page again
				/*var n=confirm("Pressing OK to confirm you above 16 years old before sending the data.");
				if(n==true){
				  var x=prompt("If you want to know the criteria for the consent process reviewed by the Research Ethics Committee of King's College London","https://www.kcl.ac.uk/research/support/rgei/research-ethics/guidelines-for-external-researchers");
				  window.open("https://www.kcl.ac.uk/research/support/rgei/research-ethics/guidelines-for-external-researchers","_blank","top=50,left=80,width=400,height=500,scrollbar=yes,statusbar=no,menubar=no,toolbar=no"); 
				}*/
			alert("Thank you for your support !")
		  }
		else {
			 
			 document.getElementById('auto-collection-control').checked=false;
			 localStorage['auto-collection-control']=false;
			 localStorage['consent-notice-user']=false;
			 //localStorage.removeItem("consent-notice-user");
			 await alert("\n You have cancelled data support. \n \n If you change your mind and decide to support our data research, please use the toggle switch to opt in or back to \"Send Data\" and select \"OK\":)\n ");
		  }
	  }
	  else{
		  alert("Thank you for your support !")
	  }
    });
  },
  
  mailsome1(){
	  const resetData = document.getElementById('mailsome-button');
    resetData.addEventListener('click', async () => {
	who=prompt("Enter developper's email address: ","xuehui.hu@kcl.ac.uk");
	what=prompt("Enter the subject: ","none");
	if (confirm("Are you sure you want to mail "+"xuehui.hu@kcl.ac.uk"+" with the subject of "+what+"?")==true){
	window.open("mailto:xuehui.hu@kcl.ac.uk?subject=Lightbeam_"+what+"&body=Thanks for your Feedback!\b"+(new Date()));
	}});
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
      
