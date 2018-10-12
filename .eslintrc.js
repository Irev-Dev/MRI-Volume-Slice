module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "no-underscore-dangle": [
            "error",
            {
                "allowAfterThis": true,
                // "enforceInMethodNames": false
            }
        ],
        "no-use-before-define": [
            "error",
            { "functions": false }
        ],
        "no-plusplus": 0
    }
};