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
                return JSON.stringify(Buffer.from(this.Rank).toString('base64'));
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
                this.Rank = JSON.parse(Buffer.from(args.DATA, 'base64').toString("utf-8"));
                this.CompareMode = args.COMPARE_MODE;
                this.SortMode = args.SORT_MODE;
            }
        })
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
        })
        api.addBlock({
            opcode: 'top.sparrowhe.easier_rank.getRankList',
            type: type.BlockType.REPORTER,
            messageId: 'top.sparrowhe.easier_rank.getRankList',
            categoryId: 'top.sparrowhe.easier_rank.category',
            function: (args) => {
                let rankList = "";
                for (let i = 0; i < this.Rank.data.length; i++) {
                    rankList += `|${i+1}|${this.Rank.data[i].player}|${this.Rank.data[i].value}|\n`;
                }
                return rankList;
            }
        })
    }
}

module.exports = EasierRank;
