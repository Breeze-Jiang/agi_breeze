// 蜜雪冰城产品之一  冰激凌
// 企业， 很多的产品， 每一种产品都实现了想同的接口（方法），
// 一个企业这么多产品， 开发这怎么记得住？ 还有那么多工厂呢？ 
// 工厂模式来搞， 你不需要了解工厂里面那么多类的实现细节，
// 只要直接和工厂类打交道就好了 
class IceCream {
  constructor() {
    this.name = '冰激凌'
    this.price = 3;
  }
  show() {
    console.log(`${this.name} ${this.price}元`)
  }
}

class LemonTea {
  constructor() {
    this.name = '柠檬水'
    this.price = 4
  }
  show() {
    console.log(`${this.name}, ${this.price}元`)
  }
}

class MilkTea {
  constructor() {
    this.name = '珍珠奶茶';
    this.price = 8;
  }
  show() {
    console.log(`${this.name}, ${this.price}元`)
  }
}

// 工厂类
class MixueFactory {
  static create(type) {
    switch(type) {
      case 'ice': 
        return new IceCream()
      case 'lemon':
        return new LemonTea()
      case 'milk':
        return new MilkTea()
    }
  }
}
// 管理并返回冰激凌这个类
const drink1 = MixueFactory.create('ice');
drink1.show();
const drink2 = MixueFactory.create('lemon');
drink2.show();