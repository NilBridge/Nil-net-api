class StatusCode {
    static OK = 0;
    static KeyWrong = 1;
    static BotNotFound = 2;
    static BotNotOnline = 3;
    static GroupNotFound = 4;
    static FriendNotFound = 5;
    static ArgumentNotFound = 6;
    static PathNotUse = 400;
    static UnknowError = 500;
}

module.exports = StatusCode;