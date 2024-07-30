const apiKey = 'AIzaSyD9ji_EC2T9B1ScvSK7D4H0GGS_q5dNym4';
const sheetId = '1ILJd4_xTGQuOTatUNwx_SsnmO48MH1wTs9KOaC4fNdw';
// const apiKey = 'AIzaSyBpK8HHKTYH-0K7noO4pfBm4IVD2eIzIn4';
// const sheetId = '1115I8AKC5vanhR3Ttd2ZzLXvwdwOQd7s';
// const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet2?key=${apiKey}`;
const apiUrl = `https://script.google.com/macros/s/AKfycbztDKow3WYvKEtFucyFeAuO1gETgmdXdPZ_O2qc5vaYJ8IO_k7SxZHGZvrkrXWn6pmwaQ/exec`;

function convert_to_title_case(str) {
    console.log("hello ji ",str)
    return str.trim().toLowerCase().split(' ').map(function (word) {

        return word.toUpperCase()
    }).join(' ');
}
console.log("hello ji")
let myData;
function get_default_card_arrangement(objects) {
    console.log(objects)
    $('#students').empty();
    // objects.sort((a, b) => {
    //     const nameA = a['Name'].toLowerCase();
    //     const nameB = b['Name'].toLowerCase();
    //     if (nameA < nameB) {
    //         return -1;
    //     }
    //     else if (nameA > nameB) {
    //         return 1;
    //     }
    //     else {
    //         return 0;
    //     }
    // });
    objects.sort((a, b) => a.Name.localeCompare(b.Name));
    // console.log(objects)
    myData = objects;
    // for (const object of objects) {
    //     
    // }
    objects.forEach((object)=>{
        $('#students').append(get_card(object));
    })
}

function get_card(object) {
    // console.log(object)
    const name = convert_to_title_case(object['Name']);
    const reg_no = object['Registration Number'];
    const specialization = object['Brochure Specialization'];
    const projects = object['Brochure Project'];
    const skills = object['Brochure Skills'];
    const github_link = object['GitHub'];
    const linkedin_link = object['Linkedin'];
    const kaggle = object['Kaggle'];
    const portfolio_link = object['DS Portfolio Link'];
   if (portfolio_link) {
    console.log(portfolio_link);
   }
    let projects_truncated = projects;
    // if project is more is than length 50, then truncate it
    if (projects.length > 100) {
        projects_truncated = projects.substring(0, 100) + "...";
        // add a learn more link to projects
        projects_truncated += `<a href="${portfolio_link}#projects" class="">Read More</a>`;
    }
    let kaggle_button = "";
    if (kaggle) {
        kaggle_button = `<a href="${kaggle}" target="_blank" class="btn btn-icon" title="Kaggle">
            <i class="fab fa-kaggle"></i>
            </a>`;
    }
    const html = $(`
        <div class="col-md-6 card" id="${reg_no}">
                    <div class="row g-0">
                        <div class="col-4 d-flex align-items-center justify-content-center">
                            <div class="circle-img">
                                <img src="assets/profile_photos/${reg_no}.jpg" class="img-fluid rounded-circle" alt="Student Image" loading="lazy">
                            </div>
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h2 class="card-title">${name}</h2>
                                <p class="card-text specialization"><b>Specialization</b>: ${specialization}</p>
                                <p class="card-text skills"><b>Skills</b>: ${skills}</p>
                                <p class="card-text projects"><b>Projects</b>: ${projects_truncated}</p>

                                <div id="socials">
                                    <a href="${linkedin_link}" target="_blank" class="btn btn-icon" title="LinkedIn">
                                        <i class="fab fa-linkedin"></i>
                                    </a>
                                    <a href="${github_link}" target="_blank" class="btn btn-icon" title="GitHub">
                                        <i class="fab fa-github"></i>
                                    </a>
                                    ${kaggle_button}
                                    <a href="${portfolio_link}" target="_blank" class="btn btn-icon" title="Portfolio">
                                        <i class="fas fa-user"></i>
                                    </a>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
            </div>
        `);
    return html;
}

let objects;

async function getData() {
    try {
        
        // ajax call to google sheets api
        let response = await fetch(apiUrl);
        const data = await response.json();
        objects = data.data;
        console.log("Data : ", data);
        get_default_card_arrangement(data.data);    
        createSkillsBarChart(data.data);


    } catch (error) {
        console.log(error)
    }
}
getData();

// if the page is at top remove the navbar-drop class from navbar else add
$(window).scroll(function () {
    if ($(this).scrollTop() === 0) {
        $('.navbar').removeClass('navbar-drop');
    }
    else {
        $('.navbar').addClass('navbar-drop');
    }
});

//#endregion

//#region search bar functions
// create a map of common abbreviations used in data science, such as nlp, iot, ml, etc. and include both the abbreviation and the full form as values
const abbreviation_map = new Map();
abbreviation_map.set('nlp', 'natural language processing');
abbreviation_map.set('iot', 'internet of things');
abbreviation_map.set('ml', 'machine learning');
abbreviation_map.set('dl', 'deep learning');
abbreviation_map.set('ai', 'artificial intelligence');
abbreviation_map.set('cv', 'computer vision');
abbreviation_map.set('rl', 'reinforcement learning');
abbreviation_map.set('powerbi', 'power bi');


function search(objects, search_text) {
    $('#students').empty();
    const filtered_objects = objects.filter(object => {
        const name = object['Name'].toLowerCase();
        const specialization = object['Brochure Specialization'].toLowerCase();
        const projects = object['Brochure Project'].toLowerCase();
        const skills = object['Brochure Skills'].toLowerCase();

        // if search text is an abbreviation, then search for the full form of the abbreviation and the abbreviation itself
        if (abbreviation_map.has(search_text)) {
            const full_form = abbreviation_map.get(search_text);
            return specialization.includes(search_text) || specialization.includes(full_form) || projects.includes(search_text) || projects.includes(full_form) || skills.includes(search_text) || skills.includes(full_form);
        }
        // if the search text is available as a value or a part of the value in the abbreviation map, then search for the key and the value
        if ([...abbreviation_map.values()].includes(search_text)) {
            const full_form = [...abbreviation_map.keys()][[...abbreviation_map.values()].indexOf(search_text)];
            const abbreviation = [...abbreviation_map.values()][[...abbreviation_map.keys()].indexOf(search_text)];
            return specialization.includes(search_text) || specialization.includes(full_form) || specialization.includes(abbreviation) || projects.includes(search_text) || projects.includes(full_form) || projects.includes(abbreviation) || skills.includes(search_text) || skills.includes(full_form) || skills.includes(abbreviation);
        }

        return name.includes(search_text) || specialization.includes(search_text) || projects.includes(search_text) || skills.includes(search_text);
    }
    );
    for (const object of filtered_objects) {
        $('#students').append(get_card(object));
    }
}

// get the search text and call search function when search-button is clicked
$('#search-button').click(function () {
    const search_text = $('#search-text').val();
    if (search_text === "") {
        get_default_card_arrangement(results);
        return;
    }
    const search_text_lower = search_text.toLowerCase();
    search(results, search_text_lower);
});

// detect change in search text and get default card arrangement if search text is empty
$('#search-text').on('input', function () {
    const search_text = $('#search-text').val();
    if (search_text === "") {
        get_default_card_arrangement(results);
    }
});

// when cursor is in text bar make enter key click on search button
$('#search-text').on('keyup', function (e) {
    console.log(e.which);
    if (e.key === 'Enter' || e.keyCode === 13) {
        $('#search-button').click();
    }
});
//#endregion

//#region statistics
function getPixelFromRem(remValue) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return remValue * rootFontSize;
}

function getSkills(objects) {
    const skillMap = new Map();
    objects.forEach(object => {
        const skills = (object['Programming Languages'] + ", " + object['Software and Technologies']).split(',').map(skill => skill.trim());
        skills.forEach(skill => {
            if (skillMap.has(skill)) {
                skillMap.set(skill, skillMap.get(skill) + 1);
            } else {
                skillMap.set(skill, 1);
            }
        });
    });
    const filteredSkills = new Map([...skillMap.entries()].filter(([skill, count]) => count > 10));
    const sortedSkills = new Map([...filteredSkills.entries()].sort((a, b) => b[1] - a[1]));
    return sortedSkills;
}

Chart.register(ChartDataLabels);

const csElective = $('#sem-2-cs-elective');
const csElective1_data = {
    labels: [
        'Image and Video Analytics',
        'Web Analytics',
        'Internet of Things',
        'Natural Language Processing',
        'Hadoop/Big Data Analytics'
    ],
    datasets: [{
        label: 'Semester 2 Computer Science Specialization',
        data: [29, 29, 27, 0, 0],
        backgroundColor: [
            'rgb(196, 140, 235)',
            'rgb(238, 153, 171)',
            'rgb(130, 208, 203)',
            'rgb(156, 204, 101)',
            'rgb(128, 164, 237)'
        ],
        hoverOffset: 4,
        datalabels: {
            anchor: 'center',
            borderWidth: 0
        }
    }, {
        label: 'Semester 3 Computer Science Specialization',
        data: [0, 0, 0, 43, 42],
        backgroundColor: [
            'transparent',
            'transparent',
            'transparent',
            'rgb(156, 204, 101)',
            'rgb(128, 164, 237)'
        ],
        hoverOffset: 4,
        datalabels: {
            anchor: 'start'
        }
    }]
};
const csElective_config = {
    type: 'doughnut',
    data: csElective1_data,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Data Analytics and Internet Technologies',
                font: {
                    size: getPixelFromRem(1.5)
                }
            },
            datalabels: {
                backgroundColor: function (context) {
                    return context.dataset.backgroundColor;
                },
                borderColor: 'white',
                borderRadius: 25,
                borderWidth: 2,
                color: 'white',
                font: {
                    weight: 'bold',
                    size: getPixelFromRem(1.2)
                },
                display: function (context) {
                    const dataset = context.dataset;
                    const count = dataset.data.length;
                    const value = dataset.data[context.dataIndex];
                    return value > count * 1.5;
                },
                padding: 6,
                formatter: function (value) {
                    return Math.round(value / 85 * 100) + '%'
                }
            }
        }
    }
};
const csElectiveChart = new Chart(csElective, csElective_config);

const statElective = $('#sem-2-stat-elective');
const statElective_data = {
    labels: [
        'Multivariate Analysis',
        'Stochastic Process',
        'Time Series Analysis',
        'Bayesian Inference',
        'Bio-Statistics'
    ],
    datasets: [{
        label: 'Semester 2 Statistics Specialization',
        data: [43, 42, 0, 0, 0],
        backgroundColor: [
            'rgb(190, 160, 210)',
            'rgb(145, 200, 190)',
            'rgb(255, 190, 165)',
            'rgb(175, 220, 185)',
            'rgb(240, 170, 195)'
        ],
        hoverOffset: 4,
        datalabels: {
            anchor: 'center',
            borderWidth: 0
        }
    }, {
        label: 'Semester 3 Statistics Statistics Specialization',
        data: [0, 0, 30, 27, 28],
        backgroundColor: [
            'rgb(190, 160, 210)',
            'rgb(145, 200, 190)',
            'rgb(255, 190, 165)',
            'rgb(175, 220, 185)',
            'rgb(240, 170, 195)'
        ],
        hoverOffset: 4,
        datalabels: {
            anchor: 'start'
        }
    }]
};
const statElective_config = {
    type: 'doughnut',
    data: statElective_data,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Statistics',
                font: {
                    size: getPixelFromRem(1.5)
                }
            },
            datalabels: {
                backgroundColor: function (context) {
                    return context.dataset.backgroundColor;
                },
                borderColor: 'white',
                borderRadius: 25,
                borderWidth: 2,
                color: 'white',
                font: {
                    weight: 'bold',
                    size: 20
                },
                display: function (context) {
                    const dataset = context.dataset;
                    const count = dataset.data.length;
                    const value = dataset.data[context.dataIndex];
                    return value > count * 1.5;
                },
                padding: 6,
                formatter: function (value) {
                    return Math.round(value / 85 * 100) + '%'
                }
            }
        }
    }
};
const statElectiveChart = new Chart(statElective, statElective_config);

function createSkillsBarChart(objects) {
    const skillCategories = {
        "Programming Languages": ["Python", "JAVA", "R", "C/C++"],
        "Data Analysis Libraries": ["MS Excel", "Pandas", "Numpy", "SQL", "NLTK"],
        "Data Visualization Tools": ["Power BI", "Seaborn", "Tableau", "Plotly"],
        "Machine Learning Frameworks": ["PyTorch", "Tensorflow", "Keras"],
        "Miscellaneous": ["MATLAB", "SPSS"]
    };

    const categoryColors = {
        "Programming Languages": 'rgba(54, 162, 235, 0.6)',
        "Data Analysis Libraries": 'rgba(75, 192, 192, 0.6)',
        "Data Visualization Tools": 'rgba(255, 99, 132, 0.6)',
        "Machine Learning Frameworks": 'rgba(153, 102, 255, 0.6)',
        "Miscellaneous": 'rgba(255, 206, 86, 0.6)'
    };

    const skillBackgroundColors = Array.from(getSkills(objects).keys()).map(skill => {
        const category = Object.keys(skillCategories).find(category => skillCategories[category].includes(skill));
        console.log("Hello ji i am in skill Background COlors",objects);
        return categoryColors[category];
    });

    const skillChartData = {
        labels: Array.from(getSkills(objects).keys()),
        datasets: [{
            label: 'Skills',
            data: Array.from(getSkills(objects).values()),
            backgroundColor: skillBackgroundColors,
            borderWidth: 1
        }]
    }
    const skillChartConfig = {
        type: 'bar',
        data: skillChartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Skills',
                    font: {
                        size: getPixelFromRem(1.5)
                    }
                }
            }
        }
    }
    const skillCanvas = $('#skills-graph');
    return new Chart(skillCanvas, skillChartConfig);
}
//#endregion

//#region Recruiters Section
$('.slick.marquee').slick({
    speed: 5000,
    autoplay: true,
    autoplaySpeed: 0,
    centerMode: true,
    cssEase: 'linear',
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    infinite: true,
    initialSlide: 1,
    arrows: false,
    buttons: false
});
//#endregion