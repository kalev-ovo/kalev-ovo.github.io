---
title: 神经网络实践：Spaceship Titanic预测模型优化笔记
date: 2025-11-25 00:41:20
tags: [神经网络, 预测模型, 机器学习]
---


在这篇博客中，我将分享在Kaggle的Spaceship Titanic竞赛中构建预测模型的完整流程，重点介绍如何通过余弦退火学习率调度器提升模型性能。

## 竞赛概述
Spaceship Titanic是Kaggle上的一个经典二分类问题，目标是预测乘客是否在宇宙飞船事故中被运输到另一个维度。这是一个典型的结构化数据分类问题，适合初学者入门机器学习。

## 模型架构与优化策略

### 核心模型结构

我构建了一个简单的全连接神经网络作为基础模型：
```python
class SpaceshipNN(nn.Module):
    def __init__(self, input_size):
        super(SpaceshipNN, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 32)
        self.fc4 = nn.Linear(32, 1)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.relu(self.fc3(x))
        x = self.sigmoid(self.fc4(x))
        return x
```

### 关键优化：余弦退火学习率调度
为什么选择余弦退火？
传统的学习率调度器如ReduceLROnPlateau在验证损失停止改善时降低学习率，但这种方法可能导致训练过早收敛。余弦退火则提供了一种更平滑、周期性的学习率调整方式：
### 替换传统的ReduceLROnPlateau为CosineAnnealingLR
```python
from torch.optim.lr_scheduler import CosineAnnealingLR

# 初始化优化器
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# 初始化余弦退火学习率调度器
scheduler = CosineAnnealingLR(optimizer, T_max=50, eta_min=1e-6)
```

### 实现细节：
• T_max=50：半个周期的epoch数

• eta_min=1e-6：最小学习率

• 每个epoch后调用scheduler.step()更新学习率

### 训练流程优化
```python
def train_with_cosine_annealing(model, train_loader, val_loader, epochs=100):
    for epoch in range(epochs):
        # 训练阶段
        model.train()
        for batch in train_loader:
            # 前向传播、反向传播、参数更新
            ...
        
        # 验证阶段
        model.eval()
        with torch.no_grad():
            ...
        
        # 更新学习率（关键步骤）
        scheduler.step()
        
        # 记录和打印训练信息
        if epoch % 10 == 0:
            print(f'Epoch {epoch} | Train Loss: {train_loss:.4f} | '
                  f'Val Loss: {val_loss:.4f} | LR: {current_lr:.6f}')
```

## 实验结果

通过引入余弦退火学习率调度，模型表现有了显著提升：

- 初始得分：0.80360

- 优化后最佳得分：0.80734（提升约0.47%）

- 训练稳定性：明显改善，避免了学习率过早衰减的问题

### 技术要点总结

1. 学习率调度的重要性：合适的学习率调度策略可以显著影响模型收敛和最终性能。

2. 余弦退火的优势：
   - 平滑的学习率变化减少训练震荡

   - 周期性重启帮助跳出局部最优

   - 无需手动设置patience参数

3. 实践建议：
   - 根据数据集大小调整T_max参数

   - 监控学习率变化确保合理范围

   - 结合早停法防止过拟合

### 进一步优化方向

虽然余弦退火带来了明显改进，但仍有进一步优化的空间：

1. 带热身的余弦退火：使用CosineAnnealingWarmRestarts实现更复杂的调度策略
2. 模型架构优化：尝试更深的网络或注意力机制
3. 特征工程：深入挖掘数据特征的相关性

### 结语

通过这个项目，我深刻体会到学习率调度在深度学习中的重要性。余弦退火作为一种简单而有效的技术，值得在各类分类任务中尝试和应用。机器学习不仅是模型架构的竞赛，更是对训练细节的精心打磨。

完整代码和详细实现请参考我的Kaggle笔记本：https://www.kaggle.com/code/kalevyang/notebooke4132da306