/**
 * Mock Data for Tests
 * Converted from Python fixtures
 */

const mockTeamsResponse = {
    "sports": [
        {
            "id": "40",
            "name": "Basketball",
            "slug": "basketball",
            "leagues": [
                {
                    "id": "46",
                    "name": "NBA",
                    "slug": "nba",
                    "teams": [
                        {
                            "team": {
                                "id": "1",
                                "uid": "s:40~l:46~t:1",
                                "slug": "atlanta-hawks",
                                "abbreviation": "ATL",
                                "displayName": "Atlanta Hawks",
                                "shortDisplayName": "Hawks",
                                "name": "Hawks",
                                "nickname": "Atlanta",
                                "location": "Atlanta",
                                "color": "c8102e",
                                "alternateColor": "fdb927",
                                "isActive": true,
                                "isAllStar": false,
                                "logos": [
                                    {
                                        "href": "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
                                        "rel": ["full", "default"],
                                        "width": 500,
                                        "height": 500
                                    }
                                ],
                                "links": []
                            }
                        },
                        {
                            "team": {
                                "id": "2",
                                "uid": "s:40~l:46~t:2",
                                "slug": "boston-celtics",
                                "abbreviation": "BOS",
                                "displayName": "Boston Celtics",
                                "shortDisplayName": "Celtics",
                                "name": "Celtics",
                                "nickname": "Boston",
                                "location": "Boston",
                                "color": "007a33",
                                "alternateColor": "ba9653",
                                "isActive": true,
                                "isAllStar": false,
                                "logos": [],
                                "links": []
                            }
                        }
                    ]
                }
            ]
        }
    ]
};

const mockScoreboardResponse = {
    "leagues": [
        {
            "id": "46",
            "name": "NBA",
            "abbreviation": "NBA"
        }
    ],
    "events": [
        {
            "id": "401584666",
            "uid": "s:40~l:46~e:401584666",
            "date": "2024-12-15T19:30:00Z",
            "name": "Atlanta Hawks at Boston Celtics",
            "shortName": "ATL @ BOS",
            "season": {
                "year": 2024,
                "type": 2,
                "slug": "regular-season"
            },
            "status": {
                "type": {
                    "id": "3",
                    "state": "post",
                    "completed": true,
                    "description": "Final",
                    "detail": "Final"
                },
                "displayClock": "0:00",
                "period": 4
            },
            "competitions": [
                {
                    "id": "401584666",
                    "attendance": 19156,
                    "venue": {
                        "id": "123",
                        "fullName": "TD Garden",
                        "address": {
                            "city": "Boston",
                            "state": "MA",
                            "country": "USA"
                        },
                        "indoor": true,
                        "capacity": 19580
                    },
                    "competitors": [
                        {
                            "id": "2",
                            "homeAway": "home",
                            "winner": true,
                            "team": {
                                "id": "2",
                                "abbreviation": "BOS",
                                "displayName": "Boston Celtics",
                                "name": "Celtics",
                                "location": "Boston"
                            },
                            "score": "115",
                            "linescores": [
                                { "value": 28 },
                                { "value": 30 },
                                { "value": 27 },
                                { "value": 30 }
                            ],
                            "records": [
                                { "type": "total", "summary": "20-5" }
                            ]
                        },
                        {
                            "id": "1",
                            "homeAway": "away",
                            "winner": false,
                            "team": {
                                "id": "1",
                                "abbreviation": "ATL",
                                "displayName": "Atlanta Hawks",
                                "name": "Hawks",
                                "location": "Atlanta"
                            },
                            "score": "108",
                            "linescores": [
                                { "value": 25 },
                                { "value": 28 },
                                { "value": 30 },
                                { "value": 25 }
                            ],
                            "records": [
                                { "type": "total", "summary": "15-10" }
                            ]
                        }
                    ],
                    "broadcasts": [
                        {
                            "market": "national",
                            "names": ["ESPN"]
                        }
                    ]
                }
            ],
            "links": []
        }
    ]
};

module.exports = {
    mockTeamsResponse,
    mockScoreboardResponse
};
