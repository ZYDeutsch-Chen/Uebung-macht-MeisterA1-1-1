/*
 * 德语五位模型造句练习程序 - A1初学者模型-1
 * 
 * 功能说明:
 * - 基于德语五位模型帮助学习者理解句子结构
 * - 针对A1初学者，只释放第1和第2位，第3-5位融合成"其他"位
 * - 提供交互式学习体验，可逐步验证答案
 * - 包含动词提示功能
 * 
 * 程序特点:
 * - 第1张卡片: 显示例句中文和德文
 * - 第2张卡片: 显示句子第1位成分
 * - 第3张卡片: 显示句子第2位成分
 * - 第4张卡片: 显示句子第3-5位成分(融合为"其他"位)
 * 
 * 使用方法:
 * - 点击卡片依次验证答案(1位→2位→其他位)
 * - 点击"提示"显示动词原形
 * - 点击"看答案"查看所有正确答案
 * - 点击"下一句"切换例句
 */

// 全局变量
let currentExample = 0;
let flippedIndex = -1;
let sentenceData = null;

// UI文本配置
const uiConfig = {
  "uiText": {
    "header": "至元德语 - 造句练习",
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

/**
 * 根据权重随机抽取并打乱数组顺序
 * 使用轮盘赌选择算法根据权重随机选择元素
 * @param {Array} array - 要打乱的数组
 * @param {Number} count - 返回的元素数量，如果不指定则返回与原数组相同长度的数组
 * @returns {Array} 按权重随机抽取并打乱后的数组
 */
function shuffleByWeight(array, count = array.length) {
    const result = [];
    const availableItems = array.map((item, index) => ({
        item: item,
        index: index,
        weight: item.weight || 1
    }));
    
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    const numItems = Math.min(count, array.length);
    
    // 根据权重随机选择项目
    for (let i = 0; i < numItems; i++) {
        // 生成一个随机数
        const random = Math.random() * totalWeight;
        let weightSum = 0;
        let selectedIndex = 0;
        
        // 轮盘赌选择算法
        for (let j = 0; j < availableItems.length; j++) {
            weightSum += availableItems[j].weight;
            if (random <= weightSum) {
                selectedIndex = j;
                break;
            }
        }
        
        // 将选中的项目添加到结果中
        result.push(availableItems[selectedIndex].item);
        
        // 从可选项目中移除已选项目
        availableItems.splice(selectedIndex, 1);
    }
    
    return result;
}

/**
 * 将JSON数据映射到程序内部使用的格式，并根据权重进行随机抽取
 * 直接使用数据中提供的动词原形，无需推断
 * @param {Object} jsonData - 包含句子和词汇数据的JSON对象
 * @returns {Array} 格式化后的句子数据数组
 */
function mapSentenceData(jsonData) {
    const mappedData = jsonData.sentences.map(sentence => {
        return {
            chinese: sentence.translation,
            german: sentence.full,
            verb: sentence.verb, // 使用数据中提供的动词原形
            weight: sentence.weight || 1,
            parts: [
                { position: 1, text: sentence.parts.slot1 || '' },
                { position: 2, text: sentence.parts.slot2 || '' },
                { position: 3, text: sentence.parts.slot3 || '' },
                { position: 4, text: sentence.parts.slot4 || '' },
                { position: 5, text: '' } // 保持与原格式兼容
            ]
        };
    });
    
    // 根据权重对句子进行随机抽取和排列
    return shuffleByWeight(mappedData);
}

/**
 * 加载句子数据
 * 直接使用已加载的window.sentencesData数据
 */
function loadSentenceData() {
    try {
        // 直接使用已加载的window.sentencesData数据
        if (window.sentencesData) {
            sentenceData = mapSentenceData(window.sentencesData);
            updateExample();
        }
    } catch (error) {
        console.error('Failed to load sentence data:', error);
    }
}

// 翻转指定卡片
function flipCard(card) {
    const cardClass = card.classList[1];
    let cardIndex;
    
    if (cardClass === 'card-3') {
        cardIndex = 3; // 将合并卡片的索引视为3
    } else {
        cardIndex = parseInt(cardClass.split('-')[1]);
    }
    
    if (cardIndex === 0) {
        return;
    }
    
    // 修改翻转逻辑，允许从卡片2翻转到合并卡片3
    if ((cardIndex === 1 && flippedIndex === -1) || 
        (cardIndex === 2 && flippedIndex === 1) || 
        (cardIndex === 3 && flippedIndex === 2)) {
        card.classList.add('flipped');
        flippedIndex = cardIndex; // 设置正确索引
        
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
        
        // 处理下一个卡片的提示
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

// 翻转所有卡片
function flipAllCards() {
    for (let i = 1; i <= 2; i++) {
        const card = document.querySelector(`.card-${i}`);
        card.classList.add('flipped');
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
    }
    
    // 翻转合并的3号卡片
    const card3 = document.querySelector('.card-3');
    card3.classList.add('flipped');
    
    const prompt3 = card3.querySelector('.validation-prompt');
    if (prompt3) {
        prompt3.remove();
    }
    
    
    flippedIndex = 3;
}

// 重置所有卡片
function resetAllCards(immediate = false) {
    const cards = document.querySelectorAll('.card');
    
    if (immediate) {
        // 禁用过渡效果以实现瞬间重置
        cards.forEach(card => {
            card.style.transition = 'none';
        });
    }
    
    cards.forEach(card => {
        // 立即移除flipped类
        card.classList.remove('flipped');
        
        const prompt = card.querySelector('.validation-prompt');
        if (prompt) {
            prompt.remove();
        }
    });
    
    // 只有在非立即模式下才添加提示
    if (!immediate) {
        const firstCard = document.querySelector('.card-1');
        if (firstCard && !firstCard.querySelector('.validation-prompt')) {
            const prompt = document.createElement('div');
            prompt.className = 'validation-prompt';
            prompt.textContent = '点击验证';
            firstCard.querySelector('.card-front').appendChild(prompt);
        }
    } else {
        // 恢复过渡效果
        setTimeout(() => {
            cards.forEach(card => {
                card.style.transition = '';
            });
        }, 10);
    }
    
    flippedIndex = -1;
}

/**
 * 显示动词原形提示
 * 直接从句子数据中获取动词原形显示给用户
 */
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

// 切换到下一个例句
function switchExample() {
    if (sentenceData) {
        currentExample = (currentExample + 1) % sentenceData.length;
        // 先更新示例内容，再重置卡片状态
        updateExample();
        resetAllCards(true); // 传递true参数表示立即重置
    }
}

// 更新当前例句的界面显示
function updateExample() {
    if (sentenceData) {
        const example = sentenceData[currentExample];
        
        const chineseCardFront = document.querySelector('.card-0 .card-front .card-content');
        const chineseCardBack = document.querySelector('.card-0 .card-back .card-content');
        chineseCardFront.textContent = example.chinese;
        // 延迟更新德语句子，避免在翻转过程中暴露答案
        setTimeout(() => {
            chineseCardBack.textContent = example.german;
        }, 100);
        
        // 延迟更新1号和2号卡片的背面内容
        for (let i = 1; i <= 2; i++) {
            const partCard = document.querySelector(`.card-${i} .card-back .model-part`);
            const part = example.parts.find(p => p.position === i);
            setTimeout(() => {
                partCard.textContent = part ? part.text : '';
            }, 100);
        }
        
        // 延迟更新合并的3号卡片的背面内容
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

// 页面加载完成后的初始化函数
window.onload = function() {
    // 初始化UI文本
    initUIText();
    
    // 加载句子数据
    loadSentenceData();
    
    const firstCard = document.querySelector('.card-1');
    if (firstCard && !firstCard.querySelector('.validation-prompt')) {
        const prompt = document.createElement('div');
        prompt.className = 'validation-prompt';
        prompt.textContent = '点击验证';
        firstCard.querySelector('.card-front').appendChild(prompt);
    }
};

// 初始化UI文本
function initUIText() {
    // 设置标题
    document.querySelector('.header h1').textContent = uiConfig.uiText.header;
    
    // 设置说明标题
    document.querySelector('.instructions h2').textContent = uiConfig.uiText.instructionsTitle;
    
    // 设置说明步骤
    const instructionsList = document.querySelector('.instructions ol');
    instructionsList.innerHTML = ''; // 清空现有内容
    uiConfig.uiText.instructionSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        instructionsList.appendChild(li);
    });
    
    // 设置版权信息
    const copyrightDiv = document.querySelector('.copyright');
    copyrightDiv.innerHTML = ''; // 清空现有内容
    uiConfig.uiText.copyrightLines.forEach((line, index) => {
        const span = document.createElement('span');
        span.className = 'copyright-line';
        span.textContent = line;
        copyrightDiv.appendChild(span);
        
        // 只在第一行后添加分隔线
        if (index === 0) {
            const hr = document.createElement('hr');
            copyrightDiv.appendChild(hr);
        }
    });
}