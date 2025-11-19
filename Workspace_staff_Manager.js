const employeeHolder = document.getElementById('employeeHolder');
const planSalle = document.querySelectorAll('.planSalle');
const employeeRegistrationModal = document.getElementById('employeeModal')
const roomAssignmentModal = document.getElementById('roomAssignmentModal')
const employeeModalInputs = document.querySelectorAll('.employeeModalInput')
let employeeModalExpInputs = document.querySelectorAll('.experienceInput')
const modalEmployeeCards = document.getElementById('modalEmployeeCards')
const experienceForms = document.getElementById('experienceForms')

console.log(employeeModalInputs)
console.log(employeeModalExpInputs)

const initWorkSpace = {
    conferenceRoom: {
        employees: [],
        maxEmployees: 6
    },

    reception: {
        employees: [],
        maxEmployees: 3
    },

    serverRoom: {
        employees: [],
        maxEmployees: 2
    },
    securityRoom: {
        employees: [],
        maxEmployees: 2
    },
    staffRoom: {
        employees: [],
        maxEmployees: 6
    },
    archiveRoom: {
        employees: [],
        maxEmployees: 1
    },

}


function getRoomState(){
    if (!localStorage.getItem('workSpace')) {
        localStorage.setItem('workSpace', JSON.stringify(initWorkSpace))
    }
    return JSON.parse(localStorage.getItem('workSpace'));
}

function saveRoomState(data){
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

function saveEmployees(data){
    localStorage.setItem('unassignedEmployees', JSON.stringify(data))
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
            <div onclick="openInfoModal('${employee.id}')" class="flex-1">
            <p class="text-white text-sm font-medium">${employee.fullName}</p>
            <p class="text-xs">${employee.role}</p>
            </div>
            <button onclick="editEmployee('${employee.id}')" class="text-[#FDC700] text-sm font-medium hover:text-[#FFDF20] shrink-0">
                        Edit
                        </button>
                        </div>`
        }
        employeeHolder.innerHTML += template
    });
}

function renderAssignedEmployees() {
    let workSpace = getRoomState()
    planSalle.forEach(room => {
        room.children[1].innerHTML = ""
        Object.keys(workSpace).forEach(key => {
            if (room.id == key) {
                let template = ""
                workSpace[key].employees.forEach(employee => {
                    template +=
                        `<div class="bg-[#1A73E8] rounded-lg p-2 shadow-sm flex gap-4 items-center w-full hover:bg-[#1A68D1]">
                                <img src="${employee.photoUrl}" class="w-8 h-8 rounded-full shrink-0"></img>
                                <div class="flex-1">
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

async function renderPerRole(allowedRoles,room) {
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

function renderEmployeesInModal(room) {
    switch (room) {
        case "conferenceRoom":
            renderPerRole(["Ceo", "Cleaning", "Other", "Receptionist", "IT", "Security"],room)
            break
        case "reception":
            renderPerRole(["Ceo", "Cleaning", "Receptionist"],room)
            break
        case "serverRoom":
            renderPerRole(["Ceo", "Cleaning", "IT"],room)
            break
        case "securityRoom":
            renderPerRole(["Ceo", "Cleaning", "Security"],room)
            break
        case "staffRoom":
            renderPerRole(["Ceo", "Cleaning", "Other", "Receptionist", "IT", "Security"],room)
            break
        case "archiveRoom":
            renderPerRole(["Ceo", "Other", "Receptionist", "IT", "Security"],room)
            break
    }

}

async function assignRoom(employeeId,room){
    let id=parseInt(employeeId)
    let workSpace = getRoomState()
    let employees = await getEmployees()
    employees.forEach(employee => {
        if(employee.id == id){
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
   closeAssignmentModal()
}

function placeCard(roomname) {
    renderEmployeesInModal(roomname)
    openAssignmentModal()
}

async function removeCard(employeeId,room) {
    let id = parseInt(employeeId)
    let workSpace = await getRoomState()
    let employees = await getEmployees()
    workSpace[room].employees.forEach(employee=>{
        if(employee.id == id){
            employees.push(employee)
        }
    })
    let newlist = workSpace[room].employees.filter(employee => {
    return employee.id !== id
   })
   workSpace[room].employees=newlist
   saveEmployees(employees)
   saveRoomState(workSpace)
   renderUnassignedEmployees("")
   renderAssignedEmployees()
   closeAssignmentModal()
}

function previewImage() {
    const imagePreview = document.getElementById('imagePreview')
    imagePreview.setAttribute('src', photoInput.value)
}

function openInfoModal(employeeId) {
    let id = parseInt(employeeId)
}

function closeInfoModal() {
}

function openEmployeeRegistrationModal() {
    addExperience()
    employeeRegistrationModal.classList.remove('hidden')
}

function closeEmployeeRegistrationModal() {
    employeeRegistrationModal.classList.add('hidden')
    experienceForms.innerHTML=""
}

function addExperience() {
    experienceForms.innerHTML+=
    `<div class="bg-white p-4 rounded-lg space-y-4 border-2 border-[#00BFA5]">
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
              </div>
            </div>`
}

function addEmployee() {

}

async function fillForm(id) {
    let employees = await getEmployees()
    let index = 0
    employees.forEach(employee=>{
        if(employee.id == id){
            employeeModalInputs[0].value=employee.fullName
            employeeModalInputs[1].value=employee.role
            employeeModalInputs[2].value=employee.photoUrl
            employeeModalInputs[3].value=employee.numTel
            employeeModalInputs[4].value=employee.email
            employee.experiences.forEach(async experience=> {
                await addExperience()
                employeeModalExpInputs = document.querySelectorAll('.experienceInput')
                employeeModalExpInputs[0+index].value = experience.company
                employeeModalExpInputs[1+index].value = experience.role
                employeeModalExpInputs[2+index].value = experience.startDate
                employeeModalExpInputs[3+index].value = experience.endDate
                index = index + 4
            });
        }
    
    })
}

async function editEmployee(employeeId) {
    let id = parseInt(employeeId)
    await fillForm(id)
    openEmployeeRegistrationModal()
}

function openAssignmentModal() {
    roomAssignmentModal.classList.remove('hidden')
}

function closeAssignmentModal() {
    roomAssignmentModal.classList.add('hidden')
}


function initApp() {
    const photoInput = document.getElementById('photoInput');
    const closeEmployeeFormButton = document.getElementById('closeEmployeeFormButton')
    const addEmployeeButton = document.getElementById('addEmployeeButton')
    const employeeFilter = document.getElementById('employeeFilter')
    const addExperienceButton = document.getElementById('addExperienceButton')
    const cancelRoomAssignment = document.getElementById('cancelRoomAssignment')

    cancelRoomAssignment.addEventListener('click', closeAssignmentModal)
    addExperienceButton.addEventListener('click', addExperience)
    employeeFilter.addEventListener('input', () => {
        renderUnassignedEmployees(employeeFilter.value)
    })
    addEmployeeButton.addEventListener('click', openEmployeeRegistrationModal)
    closeEmployeeFormButton.addEventListener('click', closeEmployeeRegistrationModal)
    photoInput.addEventListener('change', previewImage)

    renderUnassignedEmployees("")
    renderAssignedEmployees()
}

initApp()