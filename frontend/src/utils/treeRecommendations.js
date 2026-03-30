export const getTreeRecommendation = (pollutant) => {
    switch (pollutant) {
        case "CO":
            return {
                gas: "Carbon Monoxide (CO)",
                reason: "These trees absorb carbon monoxide efficiently and improve oxygen levels.",
                trees: [
                    {
                        name: "Peepal (Ficus religiosa)",
                        link: "https://en.wikipedia.org/wiki/Ficus_religiosa"
                    },
                    {
                        name: "Neem (Azadirachta indica)",
                        link: "https://en.wikipedia.org/wiki/Azadirachta_indica"
                    },
                    {
                        name: "Banyan (Ficus benghalensis)",
                        link: "https://en.wikipedia.org/wiki/Ficus_benghalensis"
                    }
                ]
            };

        case "NO2":
            return {
                gas: "Nitrogen Dioxide (NO2)",
                reason: "These trees help reduce nitrogen-based pollutants from vehicle emissions.",
                trees: [
                    {
                        name: "Ashoka (Polyalthia longifolia)",
                        link: "https://en.wikipedia.org/wiki/Polyalthia_longifolia"
                    },
                    {
                        name: "Arjun (Terminalia arjuna)",
                        link: "https://en.wikipedia.org/wiki/Terminalia_arjuna"
                    },
                    {
                        name: "Amaltas (Cassia fistula)",
                        link: "https://en.wikipedia.org/wiki/Cassia_fistula"
                    }
                ]
            };

        case "PM2.5":
            return {
                gas: "Particulate Matter (PM2.5)",
                reason: "These plants trap fine particulate matter on their leaf surfaces.",
                trees: [
                    {
                        name: "Neem (Azadirachta indica)",
                        link: "https://en.wikipedia.org/wiki/Azadirachta_indica"
                    },
                    {
                        name: "Tulsi (Ocimum tenuiflorum)",
                        link: "https://en.wikipedia.org/wiki/Ocimum_tenuiflorum"
                    },
                    {
                        name: "Areca Palm (Dypsis lutescens)",
                        link: "https://en.wikipedia.org/wiki/Dypsis_lutescens"
                    }
                ]
            };

        case "Ozone":
            return {
                gas: "Ground-level Ozone (O3)",
                reason: "These trees are tolerant to ozone and help reduce its concentration.",
                trees: [
                    {
                        name: "Silver Birch (Betula pendula)",
                        link: "https://en.wikipedia.org/wiki/Betula_pendula"
                    },
                    {
                        name: "Pine (Pinus sylvestris)",
                        link: "https://en.wikipedia.org/wiki/Pinus_sylvestris"
                    },
                    {
                        name: "Juniper (Juniperus communis)",
                        link: "https://en.wikipedia.org/wiki/Juniperus_communis"
                    }
                ]
            };

        default:
            return null;
    }
};