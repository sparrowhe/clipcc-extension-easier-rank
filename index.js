const { Extension, type, api } = require('clipcc-extension');


class EasierRank extends Extension {
    onInit() {
        console.log("EasierRank extension loaded");
        this.CompareMode = "leq"; // leq, geq
        this.SortMode = "asc"; // asc, desc
        this.Rank = {
            meta: {
                RankValueName: "Score",
                RankPlayerName: "Player",
            },
            data: []
        };
        api.addCategory({
            categoryId: 'top.sparrowhe.easier_rank.category',
            messageId: 'top.sparrowhe.easier_rank.category',
            color: '#66CCFF'
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.addToRank',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.addToRank',
            categoryId: 'top.sparrowhe.easier_rank.category',
            param: {
                USER: {
                    type: type.ParameterType.STRING,
                    default: 'SparrowHe',
                },
                VALUE: {
                    type: type.ParameterType.NUMBER,
                    default: 0,
                }
            },
            function: (args) => {
                let rankData = {
                    player: args.USER,
                    value: args.VALUE
                }

                // 查找同用户以往记录
                let samePlayer = this.Rank.data.find(item => item.player === rankData.player);
                if (samePlayer) {
                    switch (this.CompareMode) {
                        case "leq":
                            if (samePlayer.value <= rankData.value) {
                                samePlayer.value = rankData.value;
                            }
                            break;
                        case "geq":
                            if (samePlayer.value >= rankData.value) {
                                samePlayer.value = rankData.value;
                            }
                            break;
                    }
                } else {
                    this.Rank.data.push(rankData);
                }
                this.Rank.data.sort((a, b) => {
                    return a.value - b.value;
                });
                if (this.SortMode === "desc") {
                    this.Rank.data.reverse();
                }
                return window.btoa(encodeURIComponent(JSON.stringify(this.Rank)));
                // this.Rank.data.push(rankData);
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.getRankScore',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.getRankScore',
            categoryId: 'top.sparrowhe.easier_rank.category',
            param: {
                USER: {
                    type: type.ParameterType.STRING,
                    default: 'SparrowHe'
                }
            },
            function: (args) => {
                let rankData = this.Rank.data.find(item => item.player === args.USER);
                if (rankData) {
                    return rankData.value;
                } else {
                    return -1;
                }
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.getRank',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.getRank',
            categoryId: 'top.sparrowhe.easier_rank.category',
            param: {
                USER: {
                    type: type.ParameterType.STRING,
                    default: 'SparrowHe'
                }
            },
            function: (args) => {
                let rankData = this.Rank.data.find(item => item.player === args.USER);
                if (rankData) {
                    let rank = this.Rank.data.indexOf(rankData) + 1;
                    return rank;
                }
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.initRank',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.easier_rank.initRank',
            categoryId: 'top.sparrowhe.easier_rank.category',
            param: {
                DATA: {
                    type: type.ParameterType.STRING,
                    default: ''
                },
                COMPARE_MODE: {
                    type: type.ParameterType.STRING,
                    menu: [
                        { 
                            messageId: 'top.sparrowhe.easier_rank.compare_mode.menu.leq',
                            value: 'leq'
                        },
                        {
                            messageId: 'top.sparrowhe.easier_rank.compare_mode.menu.geq',
                            value: 'geq'
                        }
                    ],
                    default: 'leq'
                },
                SORT_MODE: {
                    type: type.ParameterType.STRING,
                    menu: [
                        { 
                            messageId: 'top.sparrowhe.easier_rank.compare_mode.menu.asc',
                            value: 'asc'
                        },
                        {
                            messageId: 'top.sparrowhe.easier_rank.compare_mode.menu.desc',
                            value: 'desc'
                        }
                    ],
                    default: 'asc'
                }
            },
            function: (args) => {
                try {
                    this.Rank = JSON.parse(decodeURIComponent(window.atob(args.DATA)));
                    this.CompareMode = args.COMPARE_MODE;
                    this.SortMode = args.SORT_MODE;
                } catch (error) {
                    this.Rank = {
                        meta: {
                            RankValueName: "Score",
                            RankPlayerName: "Player",
                        },
                        data: []
                    };
                    console.log(error);
                }
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.sortRank',
            type: type.BlockType.COMMAND,
            messageId: 'top.sparrowhe.easier_rank.sortRank',
            categoryId: 'top.sparrowhe.easier_rank.category',
            function: (args) => {
                this.Rank.data.sort((a, b) => {
                    return a.value - b.value;
                });
                if (this.SortMode === "desc") {
                    this.Rank.data.reverse();
                }
            }
        });
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.getRankListMarkdown',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.getRankListMarkdown',
            categoryId: 'top.sparrowhe.easier_rank.category',
            function: (args) => {
                let rankList = "";
                for (let i = 0; i < this.Rank.data.length; i++) {
                    rankList += `|${i+1}|${this.Rank.data[i].player}|${this.Rank.data[i].value}|\n`;
                }
                return rankList;
            }
        })
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.getRankList',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.getRankList',
            categoryId: 'top.sparrowhe.easier_rank.category',
            param: {
                TYPE: {
                    type: type.ParameterType.STRING,
                    menu: [
                        {
                            messageId: 'top.sparrowhe.easier_rank.type.menu.player',
                            value: 'player'
                        },
                        {
                            messageId: 'top.sparrowhe.easier_rank.type.menu.value',
                            value: 'value'
                        },
                        {
                            messageId: 'top.sparrowhe.easier_rank.type.menu.all',
                            value: 'all'
                        }
                    ],
                    default: 'player'
                },
                SPLIT_CHAR: {
                    type: type.ParameterType.STRING,
                    default: '|'
                },
                NEWLINE_CHAR: {
                    type: type.ParameterType.STRING,
                    default: '/'
                }
            },
            function: (args) => {
                let rankList = "";
                for (let i = 0; i < this.Rank.data.length; i++) {
                    if (args.TYPE === "player") {
                        rankList += `${this.Rank.data[i].player}`;
                    } else if (args.TYPE === "value") {
                        rankList += `${this.Rank.data[i].value}`;
                    } else if (args.TYPE === "all") {
                        rankList += `${this.Rank.data[i].player}${args.SPLIT_CHAR}${this.Rank.data[i].value}`;
                    }
                    if (i !== this.Rank.data.length - 1) {
                        rankList += args.NEWLINE_CHAR;
                    }
                }
                return rankList;
            }
        })
    }
}

module.exports = EasierRank;
