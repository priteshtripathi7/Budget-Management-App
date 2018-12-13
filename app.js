var dataController = ( function() {
    //controls the data and budget.
    
    //function constructor for expenses
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
         
    };
    
    Expense.prototype.returnPercentages = function() {
        return this.percentage;
    }
    
    //function constructor for income
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateArraySum = function(type) {
        var arrSum = 0;
        var requiredArray = data.allExpenses[type];
        
        requiredArray.forEach(function(current, index, array){
           arrSum += current.value; 
        });
        return arrSum;
    }
    
    //data which has the entire storage
    var data = {
        allExpenses: {
            inc: new Array(),
            exp: new Array()
        },
        expense: {
            income: 0,
            expense: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        updateData: function(type, des, value) {
            
            var newItem, id;
            
            if(data.allExpenses[type].length  > 0) {
                
                id = data.allExpenses[type][data.allExpenses[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            
            if(type === 'inc') {
                newItem = new Income(id, des, value);
            } else if (type === 'exp') {
                newItem = new Expense(id, des, value);
            }
            
            data.allExpenses[type].push(newItem);
            return newItem;
        },
        
        calculateBudget: function() {
            
            //1.calculating the total of the array
            data.expense.income = calculateArraySum('inc');
            data.expense.expense = calculateArraySum('exp');
            
            //2.Calculating the budget
            data.budget = data.expense.income - data.expense.expense;
            
            //3.Calculating the percentages
            if(data.expense.income > 0) {
                data.percentage = Math.round((data.expense.expense/data.expense.income) * 100);
            } else {
                data.percentage = -1;
            }
            
            
        },
        
        calculatePercentages: function() {
            data.allExpenses.exp.forEach( function(current) {
                current.calcPercentages(data.expense.income);
            });
            
        },
        
        getPercentages: function() {
            var percentageArray;
            percentageArray = data.allExpenses.exp.map( function(current) {
                return current.percentage;
            });
            return percentageArray;
            
        },
        
        deleteData: function(type, ID) {
            var idArray, index
            idArray = data.allExpenses[type].map(function(current) {
                return current.id;
            });
            
            index = idArray.indexOf(ID);
            
            if(index !== -1) {
                data.allExpenses[type].splice(index, 1);
            }
            
        },
        
        testing: function() {
            console.log(data);
        },
        
        returnData: function() {
            return {
                budget: data.budget,
                totalInc: data.expense.income,
                totalExp: data.expense.expense,
                per: data.percentage
            };
        }
    };
    
    
})();




var UIController = ( function() {
    //controls the user interface
    
    //creating an DOM object for DOM Manipulations.
    //everything outside of the return statement is private
    var DOMSelector = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        totalBudget: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        percentageSelector: '.budget__expenses--percentage',
        conatiner: '.container',
        percentageSelect: '.item__percentage',
        dateSelect: '.budget__title--month'
    };
    
    var formatDisplay = function(num, type) {
        var numSplit, int, dec, type;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    //function to take inputs that should be visible publically
    //Everything in the return statements is public
    return {
        
        //this function takes the input from UI and can be accessed from outside .
        //it returns an object conatining all the input data.
        getInput: function() {
            return {
                inputType: document.querySelector(DOMSelector.type).value,
                inputDescription: document.querySelector(DOMSelector.description).value,
                inputValue: parseFloat(document.querySelector(DOMSelector.value).value)
            };
        },
        
        addItemToDOM: function(ele, type) {
            var textToBeString, newTextToBeString, placeToInsert;
            
            //Create new HTML String
            if(type === 'inc') {
                placeToInsert = DOMSelector.incomeContainer;
                
                textToBeString = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                placeToInsert = DOMSelector.expenseContainer;
                
                textToBeString = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replacing the id,value and correct description.
            
            newTextToBeString = textToBeString.replace('%id%', ele.id);
            newTextToBeString = newTextToBeString.replace('%description%', ele.description);
            newTextToBeString = newTextToBeString.replace('%value%', formatDisplay(ele.value, type));
            
            //Insert the new object into DOM
            document.querySelector(placeToInsert).insertAdjacentHTML('beforeend', newTextToBeString);
        },
        
        clearInputs: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMSelector.description + ' ,' + DOMSelector.value);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
               current.value = ''; 
            });
            
            fields[0].focus();
        },
        
        displayBudget: function(object) {
            var type;
            
            object.budget >= 0 ? type = 'inc' : type = 'exp'; 
            
            document.querySelector(DOMSelector.totalBudget).textContent = formatDisplay(object.budget, type);
            document.querySelector(DOMSelector.totalIncome).textContent = formatDisplay(object.totalInc, 'inc');
            document.querySelector(DOMSelector.totalExpense).textContent = formatDisplay(object.totalExp, 'exp');
            
            if(object.per > 0) {
                document.querySelector(DOMSelector.percentageSelector).textContent = object.per + '%';
            } else {
                document.querySelector(DOMSelector.percentageSelector).textContent = '***';
            }
        },
        
        displayPercentages: function(percentage) {
            var selector;
            selector = document.querySelectorAll(DOMSelector.percentageSelect);
            
            nodeListForEach(selector, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '***';
                }
            });
        },
        
        deleteItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        diaplayDate: function() {
            var now, months, month, year;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            year = now.getFullYear();
            
            document.querySelector(DOMSelector.dateSelect).textContent = months[month] + ' ' + year;
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMSelector.type + ',' +
                DOMSelector.description + ',' +
                DOMSelector.value
            );
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            
            
            document.querySelector(DOMSelector.btn).classList.toggle('red');
        },
        
        getDOMSelector: function() {
            return DOMSelector;
        }
    };
    
})();




var controller = ( function(UICtrl, dataCtrl) {
    //controls the entire project.
    
    var setupEventListners = function() {
        
        var DOMSelector = UICtrl.getDOMSelector();
        
        document.querySelector(DOMSelector.btn).addEventListener('click', ctrlAddEvents);

        document.addEventListener('keypress', function(e) {
           if(e.keyCode == 13 || e.which == 13) {
               ctrlAddEvents();
           } 
        });
        
        document.querySelector(DOMSelector.conatiner).addEventListener('click', ctrlDeleteEvents);
        
        document.querySelector(DOMSelector.type).addEventListener('change', UICtrl.changeType);
        
    };
    
    var dataCalculator = function() {
        
        //1.Calculate the Budget
        dataCtrl.calculateBudget();
        
        //2.Return budget.
        var calculatedBudget = dataCtrl.returnData();
        
        //3.Display the budget on the UI
        UICtrl.displayBudget(calculatedBudget);
        
    };
    
    var percentageCalculator = function() {
        //1.Calculate Percentages
        dataCtrl.calculatePercentages();
        
        //2.Get the percentages
        var percentageArr = dataCtrl.getPercentages();
        
        //3.Display the percentage sun the UI
        UICtrl.displayPercentages(percentageArr);
        
        
    };
    
    var ctrlAddEvents = function() {
        
        //1.Get Inputs
        var Input = UICtrl.getInput();
        
        //Checking for valid input fields
        if(Input.inputDescription !== '' && !isNaN(Input.inputValue)) {
            
            //2.Add items to the data controller.
            var newItem = dataCtrl.updateData(Input.inputType, Input.inputDescription, Input.inputValue);

            //3.Add item to the UI
            UICtrl.addItemToDOM(newItem, Input.inputType);

            //4.Clearing the fields.
            UICtrl.clearInputs();

            //5. Update the budget.
            dataCalculator();
            
            //6.Update percentages
            percentageCalculator();
        
        }
        
    };
    
    var ctrlDeleteEvents = function(event) {
        var item, sliceID, ID, type;
        
        item = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(item) {
            sliceID = item.split('-');
            type = sliceID[0];
            ID = parseInt(sliceID[1]);
            
            //1.Update the data structure
            dataCtrl.deleteData(type, ID);
            
            //2.Update the UI
            UICtrl.deleteItem(item);
            
            //3.Update and calculate the budget
            dataCalculator();
            
            //4.Update percentages
            percentageCalculator();
        }
    };
    
    return {
        init: function() {
            UICtrl.diaplayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                per: -1
            });
            setupEventListners();
        }
    };
    
})(UIController, dataController);

// Main controlling unit.
controller.init();





