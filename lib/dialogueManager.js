/**
 * DialogueManager - Rule-based dialogue system for banking operations in Hassaniya/Arabic
 * Supports: transfer, withdraw, recharge, and balance check intents
 */

class DialogueManager {
  constructor() {
    // Intent keywords mapping
    this.INTENTS = {
      transfer: ["حول", "ارسل", "رسل", "احول"],
      withdraw: ["سحب", "نسحب", "اسحب", "ابغ نسحب", "نبغ نسحب"],
      recharge: ["زيني", "الإنترنت", "نت", "عبّي", "عبي"],
      balance: ["رصيدي", "الرصيد", "شنه رصيدي", "كم عندي", "رصيد"]
    };

    // Response templates
    this.RESPONSES = {
      transfer_confirm: "هل تؤكد تحويل {amount} أوقية إلى الرقم {phone}؟",
      transfer_done: "تم تحويل المبلغ بنجاح ✅",
      transfer_need_phone: "من فضلك، أدخل رقم الهاتف الذي تريد التحويل إليه.",
      transfer_need_amount: "من فضلك، حدد المبلغ الذي تريد تحويله.",
      withdraw_confirm: "هل تؤكد سحب {amount} أوقية من حسابك؟",
      withdraw_done: "تم السحب بنجاح ✅",
      withdraw_need_amount: "من فضلك، حدد المبلغ الذي تريد سحبه.",
      balance_show: "رصيدك الحالي هو {balance} أوقية 💰",
      recharge_confirm: "هل تريد تعبئة الإنترنت بمبلغ {amount} أوقية؟",
      recharge_done: "تمت تعبئة الإنترنت بنجاح ✅",
      recharge_need_amount: "من فضلك، حدد مبلغ التعبئة.",
      unknown: "عذراً، لم أفهم طلبك. يمكنني مساعدتك في: تحويل الأموال، السحب، تعبئة الإنترنت، أو معرفة الرصيد.",
      confirm_cancelled: "تم إلغاء العملية.",
      invalid_amount: "المبلغ غير صحيح. من فضلك أدخل رقماً صحيحاً.",
      invalid_phone: "رقم الهاتف غير صحيح. من فضلك أدخل رقماً صحيحاً (8 أرقام)."
    };

    // Confirmation words
    this.CONFIRMATION_YES = ["نعم", "ايه", "تمام", "أكيد", "موافق", "صح", "yes", "ok"];
    this.CONFIRMATION_NO = ["لا", "لأ", "إلغاء", "الغي", "no", "cancel"];

    // Mock balance for demo
    this.MOCK_BALANCE = 5000;
  }

  /**
   * Main processing function
   * @param {string} transcript - User's speech transcript
   * @param {object} sessionState - Current conversation state
   * @returns {object} - { response, newState, intent }
   */
  processTranscript(transcript, sessionState = null) {
    // Initialize state if needed
    if (!sessionState) {
      sessionState = {
        intent: null,
        waitingFor: null,
        extractedData: {}
      };
    }

    // Handle confirmation responses
    if (sessionState.waitingFor === 'confirmation') {
      return this.handleConfirmation(transcript, sessionState);
    }

    // Handle missing data responses
    if (sessionState.waitingFor === 'amount' || sessionState.waitingFor === 'phone') {
      return this.handleMissingData(transcript, sessionState);
    }

    // Detect new intent
    const intent = this.detectIntent(transcript);
    
    if (!intent) {
      return {
        response: this.RESPONSES.unknown,
        newState: { intent: null, waitingFor: null, extractedData: {} },
        intent: 'unknown'
      };
    }

    // Process based on intent
    switch (intent) {
      case 'balance':
        return this.handleBalance(sessionState);
      
      case 'transfer':
        return this.handleTransfer(transcript, sessionState);
      
      case 'withdraw':
        return this.handleWithdraw(transcript, sessionState);
      
      case 'recharge':
        return this.handleRecharge(transcript, sessionState);
      
      default:
        return {
          response: this.RESPONSES.unknown,
          newState: { intent: null, waitingFor: null, extractedData: {} },
          intent: 'unknown'
        };
    }
  }

  /**
   * Detect intent from transcript
   */
  detectIntent(transcript) {
    const normalizedText = transcript.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(this.INTENTS)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          return intent;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract amount from text (supports Arabic and Western numerals)
   */
  extractAmount(text) {
    // Arabic numerals
    const arabicNumerals = {
      'صفر': 0, 'واحد': 1, 'اثنين': 2, 'ثلاثة': 3, 'أربعة': 4,
      'خمسة': 5, 'ستة': 6, 'سبعة': 7, 'ثمانية': 8, 'تسعة': 9,
      'عشرة': 10, 'عشرين': 20, 'ثلاثين': 30, 'أربعين': 40, 'خمسين': 50,
      'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90,
      'مئة': 100, 'مائة': 100, 'ألف': 1000, 'الف': 1000
    };

    // Check for Arabic numerals
    for (const [word, value] of Object.entries(arabicNumerals)) {
      if (text.includes(word)) {
        return value;
      }
    }

    // Extract Western numerals
    const matches = text.match(/\d+/);
    if (matches) {
      return parseInt(matches[0], 10);
    }

    return null;
  }

  /**
   * Extract phone number (8 digits)
   */
  extractPhone(text) {
    const matches = text.match(/\d{8}/);
    return matches ? matches[0] : null;
  }

  /**
   * Validate phone number
   */
  isValidPhone(phone) {
    return phone && /^\d{8}$/.test(phone);
  }

  /**
   * Validate amount
   */
  isValidAmount(amount) {
    return amount && amount > 0 && !isNaN(amount);
  }

  /**
   * Handle balance inquiry
   */
  handleBalance(sessionState) {
    return {
      response: this.RESPONSES.balance_show.replace('{balance}', this.MOCK_BALANCE),
      newState: { intent: null, waitingFor: null, extractedData: {} },
      intent: 'balance'
    };
  }

  /**
   * Handle transfer intent
   */
  handleTransfer(transcript, sessionState) {
    const amount = this.extractAmount(transcript);
    const phone = this.extractPhone(transcript);

    const newState = {
      intent: 'transfer',
      waitingFor: null,
      extractedData: {}
    };

    // Check if we have both amount and phone
    if (amount && phone) {
      if (!this.isValidAmount(amount)) {
        return {
          response: this.RESPONSES.invalid_amount,
          newState: { intent: null, waitingFor: null, extractedData: {} },
          intent: 'transfer'
        };
      }
      if (!this.isValidPhone(phone)) {
        return {
          response: this.RESPONSES.invalid_phone,
          newState: { intent: null, waitingFor: null, extractedData: {} },
          intent: 'transfer'
        };
      }

      newState.extractedData = { amount, phone };
      newState.waitingFor = 'confirmation';
      
      return {
        response: this.RESPONSES.transfer_confirm
          .replace('{amount}', amount)
          .replace('{phone}', phone),
        newState,
        intent: 'transfer'
      };
    }

    // Missing data
    if (!amount) {
      newState.extractedData = { phone };
      newState.waitingFor = 'amount';
      return {
        response: this.RESPONSES.transfer_need_amount,
        newState,
        intent: 'transfer'
      };
    }

    if (!phone) {
      newState.extractedData = { amount };
      newState.waitingFor = 'phone';
      return {
        response: this.RESPONSES.transfer_need_phone,
        newState,
        intent: 'transfer'
      };
    }
  }

  /**
   * Handle withdraw intent
   */
  handleWithdraw(transcript, sessionState) {
    const amount = this.extractAmount(transcript);

    const newState = {
      intent: 'withdraw',
      waitingFor: null,
      extractedData: {}
    };

    if (amount) {
      if (!this.isValidAmount(amount)) {
        return {
          response: this.RESPONSES.invalid_amount,
          newState: { intent: null, waitingFor: null, extractedData: {} },
          intent: 'withdraw'
        };
      }

      newState.extractedData = { amount };
      newState.waitingFor = 'confirmation';
      
      return {
        response: this.RESPONSES.withdraw_confirm.replace('{amount}', amount),
        newState,
        intent: 'withdraw'
      };
    }

    // Missing amount
    newState.waitingFor = 'amount';
    return {
      response: this.RESPONSES.withdraw_need_amount,
      newState,
      intent: 'withdraw'
    };
  }

  /**
   * Handle recharge intent
   */
  handleRecharge(transcript, sessionState) {
    const amount = this.extractAmount(transcript);

    const newState = {
      intent: 'recharge',
      waitingFor: null,
      extractedData: {}
    };

    if (amount) {
      if (!this.isValidAmount(amount)) {
        return {
          response: this.RESPONSES.invalid_amount,
          newState: { intent: null, waitingFor: null, extractedData: {} },
          intent: 'recharge'
        };
      }

      newState.extractedData = { amount };
      newState.waitingFor = 'confirmation';
      
      return {
        response: this.RESPONSES.recharge_confirm.replace('{amount}', amount),
        newState,
        intent: 'recharge'
      };
    }

    // Missing amount
    newState.waitingFor = 'amount';
    return {
      response: this.RESPONSES.recharge_need_amount,
      newState,
      intent: 'recharge'
    };
  }

  /**
   * Handle confirmation responses
   */
  handleConfirmation(transcript, sessionState) {
    const normalizedText = transcript.toLowerCase();
    
    // Check for "yes" confirmation
    const isYes = this.CONFIRMATION_YES.some(word => normalizedText.includes(word));
    const isNo = this.CONFIRMATION_NO.some(word => normalizedText.includes(word));

    if (isNo) {
      return {
        response: this.RESPONSES.confirm_cancelled,
        newState: { intent: null, waitingFor: null, extractedData: {} },
        intent: sessionState.intent
      };
    }

    if (isYes) {
      // Execute the action
      let responseKey;
      switch (sessionState.intent) {
        case 'transfer':
          responseKey = 'transfer_done';
          break;
        case 'withdraw':
          responseKey = 'withdraw_done';
          break;
        case 'recharge':
          responseKey = 'recharge_done';
          break;
        default:
          responseKey = 'unknown';
      }

      return {
        response: this.RESPONSES[responseKey],
        newState: { intent: null, waitingFor: null, extractedData: {} },
        intent: sessionState.intent
      };
    }

    // Didn't understand confirmation
    return {
      response: "من فضلك قل نعم أو لا.",
      newState: sessionState,
      intent: sessionState.intent
    };
  }

  /**
   * Handle missing data collection
   */
  handleMissingData(transcript, sessionState) {
    const newState = { ...sessionState };

    if (sessionState.waitingFor === 'amount') {
      const amount = this.extractAmount(transcript);
      
      if (!amount || !this.isValidAmount(amount)) {
        return {
          response: this.RESPONSES.invalid_amount,
          newState: sessionState,
          intent: sessionState.intent
        };
      }

      newState.extractedData.amount = amount;

      // Check if we need more data
      if (sessionState.intent === 'transfer' && !newState.extractedData.phone) {
        newState.waitingFor = 'phone';
        return {
          response: this.RESPONSES.transfer_need_phone,
          newState,
          intent: sessionState.intent
        };
      }

      // We have all data, ask for confirmation
      newState.waitingFor = 'confirmation';
      let confirmResponse;
      
      switch (sessionState.intent) {
        case 'transfer':
          confirmResponse = this.RESPONSES.transfer_confirm
            .replace('{amount}', amount)
            .replace('{phone}', newState.extractedData.phone);
          break;
        case 'withdraw':
          confirmResponse = this.RESPONSES.withdraw_confirm.replace('{amount}', amount);
          break;
        case 'recharge':
          confirmResponse = this.RESPONSES.recharge_confirm.replace('{amount}', amount);
          break;
        default:
          confirmResponse = this.RESPONSES.unknown;
      }

      return {
        response: confirmResponse,
        newState,
        intent: sessionState.intent
      };
    }

    if (sessionState.waitingFor === 'phone') {
      const phone = this.extractPhone(transcript);
      
      if (!phone || !this.isValidPhone(phone)) {
        return {
          response: this.RESPONSES.invalid_phone,
          newState: sessionState,
          intent: sessionState.intent
        };
      }

      newState.extractedData.phone = phone;

      // Check if we need amount
      if (!newState.extractedData.amount) {
        newState.waitingFor = 'amount';
        return {
          response: this.RESPONSES.transfer_need_amount,
          newState,
          intent: sessionState.intent
        };
      }

      // We have all data, ask for confirmation
      newState.waitingFor = 'confirmation';
      return {
        response: this.RESPONSES.transfer_confirm
          .replace('{amount}', newState.extractedData.amount)
          .replace('{phone}', phone),
        newState,
        intent: sessionState.intent
      };
    }

    return {
      response: this.RESPONSES.unknown,
      newState: { intent: null, waitingFor: null, extractedData: {} },
      intent: 'unknown'
    };
  }
}

// Export for use in API routes
module.exports = { DialogueManager };

