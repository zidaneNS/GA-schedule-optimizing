const subjects = [
    {
        name: "Algebraic Structure", 
        classes: ["A1", "A2"], 
        scu: 3, 
        lecturers: ["Dr. YAYUK WAHYUNI,Dra., M.Si", "SITI ZAHIDAH,S.Si., M.Si.", "Dr. INNA KUSWANDARI,M.Si."]
    },
    {
        name: "Simulation", 
        classes: ["A1", "A2", "A3"], 
        scu: 3, 
        lecturers: ["Dr. WINDARTO,S.Si., M.Si", "Drs. EDI WINARKO,M.Cs.", "Dr. AHMADIN,S.Si., M.Si.", "Nashrul Millah,M.Si."]
    },
    {
        name: "Algebra (Practicum)", 
        classes: ["A1", "A2", "A3"], 
        scu: 1, 
        lecturers: ["NENIK ESTUNINGSIH,S.Si., M.Si.", "Dr. Siti Humaira,S.Si., M.Si.", "Bustomi,S.Si., M.Si."]
    },
    {
        name: "Real Analysis 1", 
        classes: ["A1", "A2"], 
        scu: 2, 
        lecturers: ["Dr. ERIDANI,M.Si", "MUCHAMMAD YUSUF SYAIFUDDIN,S.Si., M.Si."]
    },
    {
        name: "Mathematic Statistic", 
        classes: ["A1", "A2"], 
        scu: 4, 
        lecturers: ["Dr. WINDARTO,S.Si., M.Si", "Prof. Dr. FATMAWATI,MSi", "Dr. MISWANTO,Drs., M.Si."]
    },
    {
        name: "Introducing Complex Variable", 
        classes: ["A1", "A2"], 
        scu: 2, 
        lecturers: ["Dr. ERIDANI,M.Si", "MUCHAMMAD YUSUF SYAIFUDDIN,S.Si., M.Si."]
    },
    {
        name: "System Modelling 1", 
        classes: ["A1", "A2"], 
        scu: 2, 
        lecturers: ["Prof. Dr. FATMAWATI,MSi", "Dr. WINDARTO,S.Si., M.Si"]
    }
];

const availableRoom = ["324", "202A", "LK8", "204", "LK6", "301B", "323A", "306", "GC-301", "GC-304"];
const timeSlots = ["Mon-1", "Mon-2", "Mon-7", "Mon-8", "Mon-9", "Mon-10", "Tue-1", "Tue-2", "Tue-3", "Tue-4", "Tue-5", "Tue-9", "Tue-10", "Wed-1", "Wed-2", "Wed-3", "Wed-4", "Wed-5", "Wed-6", "Wed-10", "Thu-1", "Thu-2", "Thu-3", "Thu-4", "Thu-7", "Thu-8", "Thu-9", "Thu-10"];
const timePairs = [
    ["Mon-1", "Mon-2"],
    ["Mon-7", "Mon-8"],
    ["Mon-8", "Mon-9"],
    ["Mon-9", "Mon-10"],
    ["Tue-1", "Tue-2"],
    ["Tue-2", "Tue-3"],
    ["Tue-3", "Tue-4"],
    ["Tue-4", "Tue-5"],
    ["Tue-9", "Tue-10"],
    ["Wed-1", "Wed-2"],
    ["Wed-2", "Wed-3"],
    ["Wed-3", "Wed-4"],
    ["Wed-4", "Wed-5"],
    ["Thu-1", "Thu-2"],
    ["Thu-2", "Thu-3"],
    ["Thu-3", "Thu-4"],
    ["Thu-7", "Thu-8"],
    ["Thu-8", "Thu-9"],
    ["Thu-9", "Thu-10"]
]

// Random element generator
const generateRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

// Generate initial schedule
const generateRandomSchedule = () => {
    return subjects.flatMap(subject =>
        subject.classes.flatMap(cls => {
            const schedule = [];
            const room = generateRandomElement(availableRoom); // Ruangan konsisten untuk kelompok waktu berpasangan
            const pairCount = Math.floor(subject.scu / 2); // Jumlah pasangan
            const leftover = subject.scu % 2; // Sisa SCU yang tidak berpasangan

            // Pasangan waktu (kelipatan 2 SCU)
            for (let i = 0; i < pairCount; i++) {
                const validPair = generateRandomElement(timePairs); // Pilih pasangan waktu
                schedule.push({
                    name: subject.name,
                    cls,
                    lecturer: generateRandomElement(subject.lecturers),
                    room, // Ruangannya sama
                    time: validPair[0],
                });
                schedule.push({
                    name: subject.name,
                    cls,
                    lecturer: generateRandomElement(subject.lecturers),
                    room, // Ruangannya sama
                    time: validPair[1],
                });
            }

            // SCU yang tidak berpasangan
            for (let i = 0; i < leftover; i++) {
                schedule.push({
                    name: subject.name,
                    cls,
                    lecturer: generateRandomElement(subject.lecturers),
                    room: generateRandomElement(availableRoom), // Ruangan bisa berbeda
                    time: generateRandomElement(timeSlots), // Waktu bebas
                });
            }

            return schedule;
        })
    );
};

// Adjusted fitness function to reward consecutive time slots
const calculateFitness = schedules => {
    let fitness = 0;
    const groupedSchedules = schedules.reduce((acc, curr) => {
        const key = `${curr.name}-${curr.cls}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    for (const group of Object.values(groupedSchedules)) {
        if (group.length > 1) {
            const lecturerSet = new Set(group.map(s => s.lecturer));
            const roomSet = new Set(group.map(s => s.room));
            const times = group.map(s => s.time);
            const consecutiveTimes = times.every((time, idx) =>
                idx === 0 || timePairs.some(pair => pair.includes(time) && pair.includes(times[idx - 1]))
            );

            if (lecturerSet.size === 1 && roomSet.size === 1 && consecutiveTimes) {
                fitness += group.length;
            }
        } else {
            fitness++;
        }
    }

    return fitness;
};

// Parent selection with roulette wheel selection
const parentSelection = (population, fitnessScores) => {
    const totalFitness = fitnessScores.reduce((sum, score) => sum + score, 0);
    if (totalFitness === 0) return population.slice(0, population.length / 2);

    return population.filter((_, idx) => Math.random() < fitnessScores[idx] / totalFitness);
};

// Single-point crossover
const crossOver = parents => {
    const children = [];
    for (let i = 0; i < parents.length - 1; i += 2) {
        const cutPoint = Math.floor(Math.random() * parents[i].length);
        const child1 = [...parents[i].slice(0, cutPoint), ...parents[i + 1].slice(cutPoint)];
        const child2 = [...parents[i + 1].slice(0, cutPoint), ...parents[i].slice(cutPoint)];
        children.push(child1, child2);
    }
    return children;
};

// Mutation
const mutate = schedules => {
    const mutationRate = 0.1;
    const groupedSchedules = schedules.reduce((acc, curr) => {
        const key = `${curr.name}-${curr.cls}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    return Object.values(groupedSchedules).flatMap(group => {
        const room = group[0].room; // Preserve consistent room for the group
        return group.map((schedule, idx, arr) => {
            if (Math.random() < mutationRate) {
                schedule.time = generateRandomElement(timeSlots);
            }
            // Ensure room and timePairs consistency
            schedule.room = room;
            if (idx > 0) {
                const prevTime = arr[idx - 1].time;
                const validPair = timePairs.find(pair => pair.includes(prevTime));
                if (validPair) {
                    schedule.time = validPair.find(t => t !== prevTime);
                }
            }
            return schedule;
        });
    });
};

// Main genetic algorithm
const geneticAlgorithm = () => {
    const maxPopulation = 100;
    const maxGeneration = 2000;
    let population = Array.from({ length: maxPopulation }, generateRandomSchedule);

    for (let generation = 0; generation < maxGeneration; generation++) {
        console.time(`Generation ${generation}`);
        const fitnessScores = population.map(calculateFitness);
        const parents = parentSelection(population, fitnessScores);
        const children = crossOver(parents);
        population = [...parents, ...children].map(mutate);
        console.timeEnd(`Generation ${generation}`);
    }

    const fitnessScores = population.map(calculateFitness);
    const bestFitness = Math.max(...fitnessScores);
    return [population[fitnessScores.indexOf(bestFitness)], bestFitness];
};

console.log(geneticAlgorithm());
