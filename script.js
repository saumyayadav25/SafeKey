const inputSlider = document.querySelector("[data-lengthSlider]");
const lengthDisplay = document.querySelector("[data-lengthNumber]");
const passwordDisplay = document.querySelector("[data-passwordDisplay]");
const copyBtn = document.querySelector("[data-copy]");
const copyMsg = document.querySelector("[data-copyMsg]");
const uppercaseCheck = document.querySelector("#uppercase");
const lowercaseCheck = document.querySelector("#lowercase");
const numbersCheck = document.querySelector("#numbers");
const symbolsCheck = document.querySelector("#symbols");
const indicator = document.querySelector("[data-indicator]");
const generateBtn = document.querySelector(".generateButton");
const allCheckBox = document.querySelectorAll("input[type=checkbox]");
const symbols = '~`!@#$%^&*()_-+={[}]|:;"<,>.?/';
const saveBtn = document.getElementById("saveBtn");
const titleInput = document.getElementById("titleInput");

//initially
let password = "";
let passwordLength = 10;
let checkCount = 1;
uppercaseCheck.checked = true;
handleSlider();
//set strength circle color to grey
setIndicator("#ccc");

//set passwordLength, reflect passwordLength in UI
function handleSlider() {
    inputSlider.value = passwordLength;
    lengthDisplay.innerText = passwordLength;
    const min = inputSlider.min;
    const max = inputSlider.max;
    inputSlider.style.backgroundSize = ( (passwordLength - min)*100/(max - min)) + "% 100%"
}

// indicator color, set input parameter color 
function setIndicator(color) {
    indicator.style.backgroundColor = color;
    indicator.style.boxShadow = `0px 0px 12px 1px ${color}`;
}

// random number between min and max
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomNumber() {
    return getRndInteger(0,9);
}
function generateLowerCase() {  
    return String.fromCharCode(getRndInteger(97,123))
}
function generateUpperCase() {  
    return String.fromCharCode(getRndInteger(65,91))
}
function generateSymbol() {
    const randNum = getRndInteger(0, symbols.length);
    return symbols.charAt(randNum);
}

// password strength
function calcStrength() {
    let hasUpper = false;
    let hasLower = false;
    let hasNum = false;
    let hasSym = false;
    if(uppercaseCheck.checked) hasUpper = true;
    if(lowercaseCheck.checked) hasLower = true;
    if(numbersCheck.checked) hasNum = true;
    if(symbolsCheck.checked) hasSym = true;

    if(hasUpper && hasLower && (hasNum || hasSym) && passwordLength >= 8) {
        setIndicator("#0f0");
    } 
    else if(
        (hasLower || hasUpper) &&
        (hasNum || hasSym) &&
        passwordLength >= 6
    ) {
        setIndicator("#ff0");
    } 
    else{
        setIndicator("#f00");
    }
}

// copy on clipboard
// writeText -> promise
async function copyContent() {
    try {
        await navigator.clipboard.writeText(passwordDisplay.value);
        copyMsg.innerText = "copied";
    }
    catch(e) {
        copyMsg.innerText = "Failed";
    }
    // make copy wala span visible
    copyMsg.classList.add("active");

    setTimeout( () => {
        copyMsg.classList.remove("active");
    },2000);
}

function shufflePassword(array) {
    //Fisher Yates Method -> to shuffle array
    for(let i = array.length - 1; i > 0; i--) {
        //finding random J using random function
        const j = Math.floor(Math.random() * (i + 1));
        //swap number at i index and j index
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    let str = "";
    array.forEach((el) => (str += el));
    return str;
}

function handleCheckBoxChange() {
    checkCount = 0;
    allCheckBox.forEach( (checkbox) => {
        if(checkbox.checked) checkCount++;
    });
    //special condition
    if(passwordLength < checkCount ) {
        passwordLength = checkCount;
        handleSlider();
    }
}

// listener on checkboxes to keep track of how many checkboxes are ticked
allCheckBox.forEach( (checkbox) => {
    checkbox.addEventListener('change', handleCheckBoxChange);
})

// listener on slider
inputSlider.addEventListener('input', (e) => {
    passwordLength = e.target.value;
    handleSlider();
})

// listener on copyBtn
copyBtn.addEventListener('click', () => {
    if(passwordDisplay.value) copyContent();
})

// generate password
generateBtn.addEventListener('click', () => {
    //none of the checkbox are selected
    if(checkCount <= 0) return;

    if(passwordLength < checkCount) {
        passwordLength = checkCount;
        handleSlider();
    }

    // find new password
    console.log("Starting the Journey");
    //remove old password
    password = "";

    //let's put the stuff mentioned by checkboxes
    // if(uppercaseCheck.checked) {
    //     password += generateUpperCase();
    // }
    // if(lowercaseCheck.checked) {
    //     password += generateLowerCase();
    // }
    // if(numbersCheck.checked) {
    //     password += generateRandomNumber();
    // }
    // if(symbolsCheck.checked) {
    //     password += generateSymbol();
    // }

    let funcArr = [];
    if(uppercaseCheck.checked) funcArr.push(generateUpperCase);
    if(lowercaseCheck.checked) funcArr.push(generateLowerCase);
    if(numbersCheck.checked) funcArr.push(generateRandomNumber);
    if(symbolsCheck.checked) funcArr.push(generateSymbol);

    //compulsory addition
    for(let i = 0; i < funcArr.length; i++) {
        password += funcArr[i]();
    }
    console.log("Compulsory adddition done");

    //remaining adddition
    for(let i = 0; i < passwordLength - funcArr.length; i++) {
        let randIndex = getRndInteger(0 , funcArr.length);
        console.log("randIndex " + randIndex);
        password += funcArr[randIndex]();
    }
    console.log("Remaining adddition done");

    //shuffle the password
    password = shufflePassword(Array.from(password));
    console.log("Shuffling done");

    //show in UI
    passwordDisplay.value = password;
    console.log("UI adddition done");

    //calculate strength of password
    calcStrength();
});


// Save passwords locally
const savePassword = () => {
  const title = titleInput.value.trim();
  const pwd = passwordDisplay.value.trim();
  if (!title || !pwd) return alert("Please enter a title and generate password first");

  let data = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  data.push({ title, password: pwd });
  localStorage.setItem("savedPasswords", JSON.stringify(data));

  titleInput.value = "";
  alert("Password saved!");
};

saveBtn.addEventListener("click", savePassword);

// Render saved passwords
const renderSaved = () => {
  const list = document.getElementById("saved-list");
  list.innerHTML = "";
  let data = JSON.parse(localStorage.getItem("savedPasswords")) || [];

  if (data.length === 0) {
    // 🔴 show empty state if none
    list.innerHTML = `<p class="empty-state">No saved passwords yet!</p>`;
    return;
  }

  data.forEach((item, index) => {
    list.innerHTML += `
      <div class="password-item">
        <span>${item.title}</span>
        <input type="password" value="${item.password}" id="pwd-${index}" readonly>
        <button onclick="togglePassword(${index})">👁️</button>
        <button onclick="deletePassword(${index})">🗑️</button>
      </div>
    `;
  });
};

// Toggle visibility
window.togglePassword = (i) => {
  let input = document.getElementById(`pwd-${i}`);
  input.type = input.type === "password" ? "text" : "password";
};

// Delete password
window.deletePassword = (i) => {
  let data = JSON.parse(localStorage.getItem("savedPasswords")) || [];
  data.splice(i, 1);
  localStorage.setItem("savedPasswords", JSON.stringify(data));
  renderSaved();
};


// Navbar navigation using js
document.getElementById("nav-generate").addEventListener("click", () => {
  document.getElementById("generate-pass").style.display = "block";
  document.getElementById("saved-passwords").style.display = "none";
});
document.getElementById("nav-saved").addEventListener("click", () => {
  document.getElementById("generate-pass").style.display = "none";
  document.getElementById("saved-passwords").style.display = "block";
  renderSaved();
});