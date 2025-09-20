let currentExample = 0;
let flippedIndex = -1;
let sentenceData = null;

const uiConfig = {
  "uiText": {
    "header": "至元德语 - 造句练习A1-1",
    "instructionsTitle": "如何使用造句器",
    "instructionSteps": [
      "阅读中文句子",
      "准确判断1-2位",
      "依次点击卡片验证",
      "不会造句-点击\"看答案\"",
      "重新尝试-点击\"重试\"",
      "完成造句-点击\"下一句\""
    ],
    "copyrightLines": [
      "仅至元德语内部学员使用",
      "未经同意请勿转发和商用"
    ]
  }
};

function shuffleByWeight(array, count = array.length) {
    const result = [];
    const availableItems = array.map((item, index) => ({
        item: item,
        index: index,
        weight: item.weight || 1
    }));
    
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    const numItems = Math.min(count, array.length);
    
    for (let i = 0; i < numItems; i++) {
        const random = Math.random() * totalWeight;
        let weightSum = 0;
        let selectedIndex = 0;
        
        for (let j = 0; j < availableItems.length; j++) {
            weightSum += availableItems[j].weight;
            if (random <= weightSum) {
                selectedIndex = j;
                break;
            }
        }
        
        result.push(availableItems[selectedIndex].item);
        
        availableItems.splice(selectedIndex, 1);
    }
    
    return result;
}

function mapSentenceData(jsonData) {
    const mappedData = jsonData.sentences.map(sentence => {
        return {
            chinese: sentence.translation,
            german: sentence.full,
            verb: sentence.verb,
            weight: sentence.weight || 1,
            parts: [
                { position: 1, text: sentence.parts.slot1 || '' },
                { position: 2, text: sentence.parts.slot2 || '' },
                { position: 3, text: sentence.parts.slot3 || '' },
                { position: 4, text: sentence.parts.slot4 || '' },
                { position: 5, text: '' }
            ]
        };
    });
    
    return shuffleByWeight(mappedData);
}

function loadSentenceData() {
    try {
        if (window.sentencesData) {
            sentenceData = mapSentenceData(window.sentencesData);
            updateExample();
        }
    } catch (error) {
        console.error('Failed to load sentence data:', error);
    }
}

function flipCard(card) {
    const cardClass = card.classList[1];
    let cardIndex;
    
    if (cardClass === 'card-3') {
        cardIndex = 3;
    } else {
        cardIndex = parseInt(cardClass.split('-')[1]);
    }
    
    if (cardIndex === 0) {
        return;
    }
    
    if ((cardIndex === 1 && flippedIndex === -1) || 
        (cardIndex === 2 && flippedIndex === 1) || 
        (cardIndex === 3 && flippedIndex === 2)) {
        card.classList.add('flipped');
        flippedIndex = cardIndex;
        
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
        
        let nextCardSelector;
        if (cardIndex === 1) {
            nextCardSelector = '.card-2';
        } else if (cardIndex === 2) {
            nextCardSelector = '.card-3';
        }
        
        if (nextCardSelector) {
            const nextCard = document.querySelector(nextCardSelector);
            if (nextCard && !nextCard.querySelector('.validation-prompt')) {
                const prompt = document.createElement('div');
                prompt.className = 'validation-prompt';
                prompt.textContent = '点击验证';
                nextCard.querySelector('.card-front').appendChild(prompt);
            }
        }
    }
}

function flipAllCards() {
    for (let i = 1; i <= 2; i++) {
        const card = document.querySelector(`.card-${i}`);
        card.classList.add('flipped');
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    
    const card3 = document.querySelector('.card-3');
    card3.classList.add('flipped');
    
    const prompt3 = card3.querySelector('.validation-prompt');
    if (prompt3) {
        prompt3.remove();
    }
    
    
    flippedIndex = 3;
}

function resetAllCards(immediate = false) {
    const cards = document.querySelectorAll('.card');
    
    if (immediate) {
        cards.forEach(card => {
            card.style.transition = 'none';
        });
    }
    
    cards.forEach(card => {
        card.classList.remove('flipped');
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
    });
    
    if (!immediate) {
        const firstCard = document.querySelector('.card-1');
        if (firstCard && !firstCard.querySelector('.validation-prompt')) {
            const prompt = document.createElement('div');
            prompt.className = 'validation-prompt';
            prompt.textContent = '点击验证';
            firstCard.querySelector('.card-front').appendChild(prompt);
        }
    } else {
        setTimeout(() => {
            cards.forEach(card => {
                card.style.transition = '';
            });
        }, 10);
    }
    
    flippedIndex = -1;
}

function showHint() {
    const hintMessage = document.getElementById('hintMessage');
    if (sentenceData) {
        const currentExampleData = sentenceData[currentExample];
        const verb = currentExampleData.verb;
        
        hintMessage.textContent = verb;
        hintMessage.style.display = 'block';
        
        setTimeout(() => {
            hintMessage.style.display = 'none';
        }, 2000);
    }
}

function switchExample() {
    if (sentenceData) {
        currentExample = (currentExample + 1) % sentenceData.length;
        updateExample();
        resetAllCards(true);
    }
}

function updateExample() {
    if (sentenceData) {
        const example = sentenceData[currentExample];
        
        const chineseCardFront = document.querySelector('.card-0 .card-front .card-content');
        const chineseCardBack = document.querySelector('.card-0 .card-back .card-content');
        chineseCardFront.textContent = example.chinese;
        setTimeout(() => {
            chineseCardBack.textContent = example.german;
        }, 100);
        
        for (let i = 1; i <= 2; i++) {
            const partCard = document.querySelector(`.card-${i} .card-back .model-part`);
            const part = example.parts.find(p => p.position === i);
            setTimeout(() => {
                partCard.textContent = part ? part.text : '';
            }, 100);
        }
        
        const combinedParts = document.querySelectorAll('.card-3 .card-back .model-part');
        for (let i = 0; i < 3; i++) {
            const part = example.parts.find(p => p.position === i + 3);
            setTimeout(() => {
                combinedParts[i].textContent = part ? part.text : '';
            }, 100);
        }
        
        const indicator = document.querySelector('.example-indicator');
        indicator.textContent = `例句 ${currentExample+1}/${sentenceData.length}`;
    }
}

window.onload = function() {
    initUIText();
    
    loadSentenceData();
    
    const firstCard = document.querySelector('.card-1');
    if (firstCard && !firstCard.querySelector('.validation-prompt')) {
        const prompt = document.createElement('div');
        prompt.className = 'validation-prompt';
        prompt.textContent = '点击验证';
        firstCard.querySelector('.card-front').appendChild(prompt);
    }
};

function initUIText() {
    document.querySelector('.header h1').textContent = uiConfig.uiText.header;
    
    document.querySelector('.instructions h2').textContent = uiConfig.uiText.instructionsTitle;
    
    const instructionsList = document.querySelector('.instructions ol');
    instructionsList.innerHTML = '';
    uiConfig.uiText.instructionSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        instructionsList.appendChild(li);
    });
    
    const copyrightDiv = document.querySelector('.copyright');
    copyrightDiv.innerHTML = '';
    uiConfig.uiText.copyrightLines.forEach((line, index) => {
        const span = document.createElement('span');
        span.className = 'copyright-line';
        span.textContent = line;
        copyrightDiv.appendChild(span);
        
        if (index === 0) {
            const hr = document.createElement('hr');
            copyrightDiv.appendChild(hr);
        }
    });
}
