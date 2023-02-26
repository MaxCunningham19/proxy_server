const Manager = require('./manager')
const LINE = '---------------'
const SKIP = '\n'
const prompt = require('prompt-sync')({ sigint: true });

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


module.exports = class Console {
    constructor() {
        this.manager = new Manager()
    }

    block(url) {
        this.manager.block(url)
    }

    unblock(url) {
        this.manager.unblock(url)
    }

    visit(url) {
        this.manager.visit(url)
    }

    is_blocked(url) {
        return this.manager.is_blocked(url)
    }

    display_intro() {
        console.log('PROXY SERVER MANAGER\n' + LINE)
    }

    display_options() {
        return 'Options:\n 1. View Logs\n 2. View URL Info\n 3. Edit Block List\n' + LINE
    }

    display_logs() {
        console.log(SKIP + LINE + SKIP + this.manager.logs() + '\n' + LINE)
    }

    display_info() {
        console.log(LINE + this.manager.info() + LINE)
    }

    display_blocked() {
        let blocked = this.manager.blocked()
        console.log("List of blocked URLS:")
        for (let i = 0; i < blocked.length; i++) {
            console.log(` * ${blocked[i]}`)
        }
        console.log(LINE)
    }

    get_opt_input(min_val, max_val) {

        while (true) { }
    }

    add_URL() {
        while (true) {
            let tmp = prompt("Enter the URL you want to add or EXIT to stop: ")
            if (tmp.toUpperCase() == 'EXIT') {
                return
            }
            this.manager.block(tmp)
            console.log(`Successfully blocked ${url}`)
        }
    }

    remove_URL() {
        while (true) {
            let tmp = prompt("Enter the URL you want to unblock or EXIT to stop: ")
            if (tmp.toUpperCase() == 'EXIT') {
                return
            }
            this.manager.unblock(tmp)
            console.log(`Successfully unblocked ${url}\n`)
        }
    }

    edit_blocklist() {
        while (true) {
            console.log('\nOptions:\n 1. Add URL(s) to Blocklist\n 2. Unblock URL(s)\n 3. Display Blocklist\n 4. Leave It As It Is\n' + LINE)
            let str = prompt('Input the number of the option you wish to select: ')
            let int = parseInt(str)
            if (int >= 1 && int <= 4) {
                switch (int) {
                    case 1:
                        this.add_URL()
                        break
                    case 2:
                        this.remove_URL()
                        break
                    case 3:
                        this.display_blocked()
                        break
                    case 4:
                        return
                    default:
                }
            }
        }

    }

    async run() {
        this.display_intro()
        while (true) {
            console.log('\n' + this.display_options())
            let val = prompt('Input the number of the option you wish to select: ')
            let int = parseInt(val)
            if (int >= 1 && int <= 3) {
                switch (int) {
                    case 1:
                        this.display_logs()
                        break
                    case 2:
                        this.display_info()
                        break
                    case 3:
                        this.edit_blocklist()
                        break
                }
            } else {
                console.log("Please input a valid number.")
            }
        }
    }


}