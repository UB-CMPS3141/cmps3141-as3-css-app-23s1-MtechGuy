/*
CMPS3141-HCI - AS3-23S1
Collaborators:
Date: Sept.22.23
*/

import { createApp } from "https://mavue.mavo.io/mavue.js";

const githubAccessToken = "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"; // Replace with your GitHub access token

globalThis.app = createApp({
    data: {
		expenses: [],
		personA: "Neo",
		personB: "Trinity",
		joint: "Joint",
		totalPersonAOwes: 0,
		totalPersonBOwes: 0,
		nowDate: new Date().toISOString().slice(0,10),
		errors: "",
		
		form: {
			payer: "",
			payingTo: "",
			amount: 0,
			description: "",
			pDate: "",
			currency: "BZD"
		}
	},

    methods: {
        // ... (existing methods)
		/**
		 * Currency convert function stub.
		 * In a real app, you would use an API to get the latest exchange rates,
		 * and we'd need to support all currency codes, not just MXN, BZD and GTQ.
		 * However, for the purposes of this assignment lets just assume they travel near by so this is fine.
		 * @param {"MXN" | "BZD" | "GTQ"} from - Currency code to convert from
		 * @param {"MXN" | "BZD" | "GTQ"} to - Currency code to convert to
		 * @param {number} amount - Amount to convert
		 * @returns {number} Converted amount
		 */
		currencyConvert(from, to, amount) {
			const rates = {
				BZD: 1,
				MXN: 8.73,
				GTQ: 3.91
			};

			return amount * rates[to] / rates[from];
		},


        async addPayment() {
            // ... (existing addPayment logic)
				const payer = this.form.payer;
			const payingTo = this.form.payingTo;
			const description = this.form.description;
			const pDate = this.form.pDate;
			const currency = this.form.currency;
			const formAmount = this.form.amount.toFixed(2);
			let amount = this.form.amount.toFixed(2);

			if(payer==="" || payingTo==="" || formAmount===0 || description==="" || pDate==="") {
				this.errors = "* Please fill out all the fields!";
				return false;
			} 
			
			if(currency === "MXN") {
				amount = (this.currencyConvert("MXN", "BZD", amount)).toFixed(2)
			} else if(currency === "GTQ") {
				amount = (this.currencyConvert("GTQ", "BZD", amount)).toFixed(2)
			}

			if (confirm("Are you sure you want to add this payment? If so click 'OK'")) {
				let personAOwes = 0;
				if(payer===this.personB && payingTo===this.personA) {
					personAOwes = amount;
				} else if(payer===this.personB && payingTo===this.joint || payer===this.joint && payingTo===this.personA) {
					personAOwes = (amount/2).toFixed(2);
				} else {
					personAOwes = 0;
				}

				let personBOwes = 0;
				if(payer===this.personA && payingTo===this.personB) {
					personBOwes = amount;
				} else if(payer===this.personA && payingTo===this.joint || payer===this.joint && payingTo===this.personB) {
					personBOwes = (amount/2).toFixed(2);
				} else {
					personBOwes = 0;
				}

				this.totalPersonAOwes += Number(personAOwes);

				this.totalPersonBOwes += Number(personBOwes);

				this.expenses.push({
					payer,
					payingTo,
					amount,
					description,
					pDate,
					personAOwes,
					personBOwes, 
					currency,
					formAmount
				});
				this.form={
					payer: "",
					payingTo: "",
					amount: 0,
					description: "",
					pDate: "",
					currency: "BZD"
				};
				this.errors = "";
			} else {
				return false;
			}

            // Push the updated data to GitHub
            const githubData = JSON.stringify(this.expenses, null, 2);
            const githubApiUrl = 'https://api.github.com/repos/UB-CMPS3141/cmps3141-as3-css-app-23s1-MtechGuy/contents/expenses/data.json';
            const headers = {
                "Authorization": `Bearer ${githubAccessToken}`,
                "Accept": "application/vnd.github.v3+json"
            };
            const response = await fetch(githubApiUrl, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify({
                    message: "Update data.json",
                    content: btoa(githubData),
                    sha: this.getGitHubFileSHA() // Fetch the current SHA of the file
                })
            });

            if (response.status === 200) {
                console.log("Data pushed to GitHub successfully.");
            } else {
                console.error("Failed to push data to GitHub.");
            }
        },

        async getGitHubFileSHA() {
            const githubApiUrl = 'https://api.github.com/repos/UB-CMPS3141/cmps3141-as3-css-app-23s1-MtechGuy/contents/expenses/data.json';
            const headers = {
                "Authorization": `Bearer ${githubAccessToken}`,
                "Accept": "application/vnd.github.v3+json"
            };
            const response = await fetch(githubApiUrl, {
                method: "GET",
                headers: headers
            });

            if (response.status === 200) {
                const data = await response.json();
                return data.sha;
            } else {
                console.error("Failed to fetch file SHA from GitHub.");
                return null;
            }
        },

        // ... (other methods)
		saveButton() {
			const buttonElement = document.querySelector('.js-inputButton');

			let inputElement = document.querySelector('.personinput');

			if(buttonElement.innerText === "Save") {
				inputElement.disabled = true;
				buttonElement.innerHTML = "Edit";
			} else {
				inputElement.disabled = false;
				buttonElement.innerHTML = "Save";
			}
		},

		saveButton2() {
			const buttonElement = document.querySelector('.js-inputButton2');

			let inputElement = document.querySelector('.person2input');

			if(buttonElement.innerText === "Save") {
				inputElement.disabled = true;
				buttonElement.innerHTML = "Edit";
			} else {
				inputElement.disabled = false;
				buttonElement.innerHTML = "Save";
			}
		},

		deleteRow(index) {
			this.expenses.splice(index, 1);
		},
    },

    computed: {
        // ... (existing computed properties)
		total_balance () {
			let total = 0;

			for (let expense of this.expenses) {
				let trinity_paid = expense.trinity_paid ?? 0;
				let neo_paid = expense.neo_paid ?? 0;
				let trinity_paid_for_neo = expense.trinity_paid_for_neo ?? 0;
				let neo_paid_for_trinity = expense.neo_paid_for_trinity ?? 0;

				total += (trinity_paid - neo_paid)/2 + trinity_paid_for_neo - neo_paid_for_trinity;
			}

			return total;
		}
    }
}, "#app");
