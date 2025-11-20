const employeeHolder = document.getElementById('employeeHolder');
const planSalle = document.querySelectorAll('.planSalle');
const employeeRegistrationModal = document.getElementById('employeeModal')
const roomAssignmentModal = document.getElementById('roomAssignmentModal')
const employeeModalInputs = document.querySelectorAll('.employeeModalInput')
const modalEmployeeCards = document.getElementById('modalEmployeeCards')
const employeeInfoModal = document.getElementById('employeeInfoModal')
const experienceForms = document.getElementById('experienceFroms')
const infoElements = document.querySelectorAll('.infoElement')
const employeeInfoExperiences = document.getElementById('employeeInfoExperiences')
let employeeModalExpInputs = document.querySelectorAll('.experienceInput')

const initWorkSpace = {
    conferenceRoom: {
        employees: [],
        maxEmployees: 6,
        canBeVacant: true
    },

    reception: {
        employees: [],
        maxEmployees: 3,
        canBeVacant: false
    },

    serverRoom: {
        employees: [],
        maxEmployees: 2,
        canBeVacant: false
    },
    securityRoom: {
        employees: [],
        maxEmployees: 2,
        canBeVacant: false
    },
    staffRoom: {
        employees: [],
        maxEmployees: 6,
        canBeVacant: true
    },
    archiveRoom: {
        employees: [],
        maxEmployees: 1,
        canBeVacant: true
    },

}


function getRoomState() {
    if (!localStorage.getItem('workSpace')) {
        localStorage.setItem('workSpace', JSON.stringify(initWorkSpace))
    }
    return JSON.parse(localStorage.getItem('workSpace'));
}

function saveRoomState(data) {
    localStorage.setItem('workSpace', JSON.stringify(data))
}

async function getEmployees() {
    if (!localStorage.getItem('unassignedEmployees')) {
        try {
            const Response = await fetch("employee.json")
            if (!Response.ok) {
                throw new Error("Could not fetch Data")
            }
            const data = await Response.json()
            localStorage.setItem('unassignedEmployees', JSON.stringify(data))
        }
        catch {
            console.error(Error);
        }
    }
    return JSON.parse(localStorage.getItem('unassignedEmployees'));

}

function saveEmployees(data) {
    localStorage.setItem('unassignedEmployees', JSON.stringify(data))
}

async function renderConstraints() {
    let workSpace = getRoomState()
    Object.keys(workSpace).forEach((room, index) => {
        if ((!workSpace[room].canBeVacant) && (workSpace[room].employees.length == 0)) {
            planSalle[index].classList.add('border-[#FB2C36]')
            planSalle[index].children[0].classList.add('text-[#FB2C36]')
        } else {
            planSalle[index].classList.remove('border-[#FB2C36]')
            planSalle[index].children[0].classList.remove('text-[#FB2C36]')
        }
    })
}

async function renderUnassignedEmployees(filter) {
    let employees = await getEmployees()
    employeeHolder.innerHTML = ""
    employees.forEach(employee => {
        let template = ""
        if (employee.fullName.toLowerCase().includes(filter.toLowerCase())) {
            template +=
                `<div class="bg-[#1A73E8] rounded-lg p-2 shadow-sm flex gap-4 items-center w-[90%] hover:bg-[#1A68D1]">
            <img src="${employee.photoUrl}" class="w-8 h-8 rounded-full shrink-0"></img>
            <div onclick="returnEmployeeInfo('${employee.id}')" class="flex-1">
            <p class="text-white text-sm font-medium">${employee.fullName}</p>
            <p class="text-xs">${employee.role}</p>
            </div>
            <button onclick="editEmployee('${employee.id}','edit')" class="text-[#FDC700] text-sm font-medium hover:text-[#FFDF20] shrink-0">
                        Edit
                        </button>
                        </div>`
        }
        employeeHolder.innerHTML += template
    });
}

async function renderAssignedEmployees() {
    let workSpace = await getRoomState()
    planSalle.forEach(room => {
        room.children[1].innerHTML = ""
        Object.keys(workSpace).forEach(key => {
            if (room.id == key) {
                let template = ""
                workSpace[key].employees.forEach(employee => {
                    template +=
                        `<div class="bg-[#1A73E8] rounded-lg p-2 shadow-sm flex gap-4 items-center w-full hover:bg-[#1A68D1]">
                                <img src="${employee.photoUrl}" class="w-8 h-8 rounded-full shrink-0"></img>
                                <div class="flex-1" onclick="returnEmployeeInfo('${employee.id}')">
                                <p class="text-white text-sm font-medium ">${employee.fullName}</p>
                                <p class="text-xs">${employee.role}</p>
                                </div>
                                <button onclick="removeCard('${employee.id}','${key}')" class="flex items-center justify-center w-5 h-5 bg-[#FB2C36] text-white rounded-full hover:bg-[#E7000B] shrink-0">
                                ×
                                </button>
                                </div>`

                })

                room.children[1].innerHTML += template
                if (workSpace[key].employees.length < workSpace[key].maxEmployees) {
                    room.children[1].innerHTML +=
                        `<button onclick="placeCard('${key}')" class="flex items-center justify-center w-10 h-10 text-white rounded-full bg-[#00BFA5] hover:bg-[#00a38c] shrink-0">
                +
                </button>`
                }
            }
        })
    })
}

async function renderEmployeesInModal(allowedRoles, room) {
    let employees = await getEmployees()
    modalEmployeeCards.innerHTML = ""
    employees.forEach(employee => {
        let template = ""
        if (allowedRoles.includes(employee.role)) {
            template +=
                `<div onclick="assignRoom('${employee.id}','${room}')" class="bg-[#1A73E8] rounded-lg p-2 shadow-sm flex gap-4 items-center w-full hover:bg-[#1A68D1]">
            <img src="${employee.photoUrl}" class="w-8 h-8 rounded-full shrink-0"></img>
            <div class="flex-1">
            <p class="text-white text-sm font-medium ">${employee.fullName}</p>
            <p class="text-xs">${employee.role}</p>
            </div>
            </div>`
        }
        modalEmployeeCards.innerHTML += template
    })
}

function returnAllowedEmployees(room) {
    switch (room) {
        case "conferenceRoom":
            return ["Ceo", "Cleaning", "Other", "Receptionist", "IT", "Security"]
            break
        case "reception":
            return ["Ceo", "Cleaning", "Receptionist"]
            break
        case "serverRoom":
            return ["Ceo", "Cleaning", "IT"]
            break
        case "securityRoom":
            return ["Ceo", "Cleaning", "Security"]
            break
        case "staffRoom":
            return ["Ceo", "Cleaning", "Other", "Receptionist", "IT", "Security"]
            break
        case "archiveRoom":
            return ["Ceo", "Other", "Receptionist", "IT", "Security"]
            break
    }
}

async function assignRoom(employeeId, room) {
    let id = parseInt(employeeId)
    let workSpace = getRoomState()
    let employees = await getEmployees()
    employees.forEach(employee => {
        if (employee.id == id) {
            workSpace[room].employees.push(employee)
        }
    })
    let newEmployees = employees.filter(employee => {
        return employee.id !== id
    })
    saveEmployees(newEmployees)
    saveRoomState(workSpace)
    renderUnassignedEmployees("")
    renderAssignedEmployees()
    renderConstraints()
    closeAssignmentModal()
}

function placeCard(roomname) {
    renderEmployeesInModal(returnAllowedEmployees(roomname), roomname)
    openAssignmentModal()
}

async function removeCard(employeeId, room) {
    let id = parseInt(employeeId)
    let workSpace = await getRoomState()
    let employees = await getEmployees()
    workSpace[room].employees.forEach(employee => {
        if (employee.id == id) {
            employees.push(employee)
        }
    })
    let newlist = workSpace[room].employees.filter(employee => {
        return employee.id !== id
    })
    workSpace[room].employees = newlist
    saveEmployees(employees)
    saveRoomState(workSpace)
    renderUnassignedEmployees("")
    renderAssignedEmployees()
    renderConstraints()
    closeAssignmentModal()
}

function previewImage() {
    const imagePreview = document.getElementById('imagePreview')
    imagePreview.src = photoInput.value || 'public/default.png'
}

function addExperience() {
    let experience = document.createElement('div')
    experience.className = 'bg-white p-4 rounded-lg flex flex-col gap-4 border-2 border-[#00BFA5]';
    experience.innerHTML =
        `               <button type="button" onclick="return this.parentNode.remove();" class="self-end flex items-center justify-center w-5 h-5 bg-[#FB2C36] text-white rounded-full hover:bg-[#E7000B] shrink-0">x</button>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-[#1A73E8] mb-2">Company</label>
                                <input type="text" class="experienceInput w-full px-4 py-3 border-2 border-[#1A73E8] rounded-lg">
                            </div>         
                            <div>
                            <label class="block text-sm font-medium text-[#1A73E8] mb-2">Role</label>
                            <input type="text" class="experienceInput w-full px-4 py-3 border-2 border-[#1A73E8] rounded-lg">
                            </div>
                            <div>
                            <label class="block text-sm font-medium text-[#1A73E8] mb-2">Start Date</label>
                            <input type="date" class="experienceInput w-full px-4 py-3 border-2 border-[#1A73E8] rounded-lg">
                            </div>
                            <div>
                            <label class="block text-sm font-medium text-[#1A73E8] mb-2">End Date</label>
                            <input type="date" class="experienceInput w-full px-4 py-3 border-2 border-[#1A73E8] rounded-lg">
                            </div>
                        </div>`

    experienceForms.appendChild(experience)


}

function addEmployee() {
    validateForm()
}

async function fillForm(id) {
    let employees = await getEmployees()
    let index = 0
    employees.forEach(employee => {
        if (employee.id == id) {
            employeeModalInputs[0].value = employee.fullName
            employeeModalInputs[1].value = employee.role
            employeeModalInputs[2].value = employee.photoUrl
            employeeModalInputs[3].value = employee.numTel
            employeeModalInputs[4].value = employee.email
            employeeModalInputs[5].value = employee.id
            imagePreview.src = employee.photoUrl
            if (employee.experiences.length != 0) {
                employee.experiences.forEach(async experience => {
                    addExperience()
                    employeeModalExpInputs = document.querySelectorAll('.experienceInput')
                    employeeModalExpInputs[0 + index].value = experience.company
                    employeeModalExpInputs[1 + index].value = experience.role
                    employeeModalExpInputs[2 + index].value = experience.startDate
                    employeeModalExpInputs[3 + index].value = experience.endDate
                    index = index + 4
                });
            }
        }

    })
}

function generateId() {
    return Date.now()
}

function validateForm() {
    const nameRegex = /^[A-Za-zÀ-ÿ'\- ]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0[5-7]\d{8}$/;
    let notvalid = []
    let isvalid = true

    employeeModalExpInputs = document.querySelectorAll('.experienceInput')

    let fullName = employeeModalInputs[0].value
    let role = employeeModalInputs[1].value
    let photoUrl = employeeModalInputs[2].value
    let numTel = employeeModalInputs[3].value
    let email = employeeModalInputs[4].value
    let id = employeeModalInputs[5].value
    let experiences = []

    if (!fullName.match(nameRegex)) { isvalid = false; notvalid.push("nom") }
    if (!role) { isvalid = false; notvalid.push("role") }
    if (!numTel.match(phoneRegex)) { isvalid = false; notvalid.push("phone") };
    if (!email.match(emailRegex)) { isvalid = false; notvalid.push("email") };

    if (employeeModalExpInputs.length > 0) {
        for (let i = 0; i < employeeModalExpInputs.length; i += 4) {
            let company = employeeModalExpInputs[0 + i].value
            let role = employeeModalExpInputs[1 + i].value
            let startDate = employeeModalExpInputs[2 + i].value
            let endDate = employeeModalExpInputs[3 + i].value
            let experience = {
                company,
                role,
                startDate,
                endDate,
            }
            if (startDate > endDate || !company || !role || !startDate || !endDate) {
                isvalid = false; notvalid.push(`experience`)
            };

            experiences.push(experience)
        }
    }

    if (isvalid) {
        updateEmployee(id, fullName, role, photoUrl, numTel, email, experiences)
    } else {
        errorMsg(notvalid)
    }
}

async function updateEmployee(id, fullName, role, photoUrl, numTel, email, experiences) {
    let employees = await getEmployees()
    if (id) {
        employees.forEach(employee => {
            if (employee.id == id) {
                employee.fullName = fullName
                employee.role = role
                if (photoUrl) {
                    employee.photoUrl = photoUrl
                } else {
                    employee.photoUrl = 'public/default.png'
                }
                employee.numTel = numTel
                employee.email = email
                employee.experiences = experiences
            }
        })

    } else {
        let employee = {
            id: generateId(),
            fullName,
            role,
            photoUrl: photoUrl || 'public/default.png',
            email,
            numTel,
            experiences
        }
        employees.push(employee)
    }
    saveEmployees(employees)
    renderUnassignedEmployees("")
    closeEmployeeRegistrationModal()
}

async function editEmployee(employeeId) {
    let id = parseInt(employeeId)
    await fillForm(id)
    openEmployeeRegistrationModal()
}

async function returnEmployeeInfo(employeeId) {
    let employees = await getEmployees()
    let workSpace = await getRoomState()
    let id = parseInt(employeeId)
    employees.forEach(employee => {
        if (employee.id == id) {
            renderEmployeeInfo(employee)
        }
    })
    Object.keys(workSpace).forEach(key => {
        workSpace[key].employees.forEach(employee => {
            if (employee.id == id) {
                renderEmployeeInfo(employee, key)
            }
        })
    })
}

function renderEmployeeInfo(employee, key = null) {
    console.log(infoElements)
    infoElements[0].src = employee.photoUrl
    infoElements[1].textContent = employee.fullName
    infoElements[2].textContent = employee.role
    infoElements[3].textContent = employee.email
    infoElements[4].textContent = employee.numTel
    infoElements[5].textContent = key || "Unassigned"
    employeeInfoExperiences.innerHTML = ""
    employee.experiences.forEach((experience, index) => {
        employeeInfoExperiences.innerHTML +=
            `<h1>Experience ${index + 1}</h2>`
        showExperience(experience)
    })
    openInfoModal()
}

function showExperience(experience) {

    let experienceContainer = document.createElement('div')
    experience.className = "bg-white p-4 rounded-lg border-2 border-[#00BFA5]";
    experienceContainer.innerHTML =

        `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-[#1A73E8] mb-1">Company</label>
                <p class="text-gray-900">${experience.company}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-[#1A73E8] mb-1">Role</label>
                <p class="text-gray-900">${experience.role}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-[#1A73E8] mb-1">Start Date</label>
                <p class="text-gray-900">${experience.startDate}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-[#1A73E8] mb-1">End Date</label>
                <p class="text-gray-900">${experience.endDate}</p>
              </div>
            </div>`

    employeeInfoExperiences.appendChild(experienceContainer)

}

async function autoAssign() {
    let employees = await getEmployees()
    let workSpace = await getRoomState()
    const workSpaceKeys = Object.keys(workSpace)
    console.log(workSpaceKeys)
    while (employees.length != 0) {
        let randomRoomindex = getRandomIndex(workSpaceKeys.length)
        let randomEmployeeIndex = getRandomIndex(employees.length)
        let randomRoom = workSpaceKeys[randomRoomindex]

        if ((returnAllowedEmployees(randomRoom).includes(employees[randomEmployeeIndex].role)) && workSpace[randomRoom].employees.length < workSpace[randomRoom].maxEmployees) {
            workSpace[randomRoom].employees.push(employees[randomEmployeeIndex])
            employees = employees.filter(employee => {
                return employee != employees[randomEmployeeIndex]
            })
        }
    }
    saveEmployees(employees)
    saveRoomState(workSpace)
    renderUnassignedEmployees("")
    renderAssignedEmployees()
    renderConstraints()
}

function getRandomIndex(max) {
    return Math.floor(Math.random() * max)
}

function openEmployeeRegistrationModal() {
    employeeRegistrationModal.classList.remove('hidden')
}

function closeEmployeeRegistrationModal() {
    employeeRegistrationModal.classList.add('hidden')
    experienceForms.innerHTML = ""
    employeeModalInputs.forEach(employeeModalInput => {
        employeeModalInput.value = ""
    })
    imagePreview.src = 'public/default.png'
}

function openAssignmentModal() {
    roomAssignmentModal.classList.remove('hidden')
}

function closeAssignmentModal() {
    roomAssignmentModal.classList.add('hidden')
    renderConstraints()
}

function openInfoModal() {
    employeeInfoModal.classList.remove('hidden')
}

function closeInfoModal() {
    employeeInfoModal.classList.add('hidden')
}

function initApp() {
    const photoInput = document.getElementById('photoInput');
    const closeEmployeeFormButton = document.getElementById('closeEmployeeFormButton')
    const addEmployeeButton = document.getElementById('addEmployeeButton')
    const employeeFilter = document.getElementById('employeeFilter')
    const addExperienceButton = document.getElementById('addExperienceButton')
    const cancelRoomAssignment = document.getElementById('cancelRoomAssignment')
    const addEmployeeFormButton = document.getElementById('addEmployeeFormButton')
    const closeEmployeeInfoBtn = document.getElementById('closeEmployeeInfoBtn')
    const autoAssignButton = document.getElementById('autoAssignButton')

    closeEmployeeInfoBtn.addEventListener('click', closeInfoModal)
    cancelRoomAssignment.addEventListener('click', closeAssignmentModal)
    addExperienceButton.addEventListener('click', addExperience)
    employeeFilter.addEventListener('input', () => {
        renderUnassignedEmployees(employeeFilter.value)
    })
    addEmployeeButton.addEventListener('click', openEmployeeRegistrationModal)
    closeEmployeeFormButton.addEventListener('click', closeEmployeeRegistrationModal)
    photoInput.addEventListener('change', previewImage)
    addEmployeeFormButton.addEventListener('click', addEmployee)
    autoAssignButton.addEventListener('click', autoAssign)

    renderUnassignedEmployees("")
    renderAssignedEmployees()
    renderConstraints()
}

initApp()