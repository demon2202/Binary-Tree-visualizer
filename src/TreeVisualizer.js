import React, { useState, useRef, useEffect } from 'react';

class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
    this.isNew = true;
    this.isVisited = false;
    this.balanceFactor = 0;
  }
}

class BaseBST {
  constructor() {
    this.root = null;
    this.nodeCount = 0;
    this.traversalOrder = [];
    this.maxValue = -Infinity;
    this.minValue = Infinity;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  reset() {
    this.root = null;
    this.nodeCount = 0;
    this.traversalOrder = [];
    this.maxValue = -Infinity;
    this.minValue = Infinity;
  }

  search(value, animate = true) {
    let path = [];
    let current = this.root;
    
    while (current) {
      if (animate) {
        current.isVisited = true;
        path.push(current);
      }
      if (value === current.value) return { found: true, path };
      current = value < current.value ? current.left : current.right;
    }
    return { found: false, path };
  }

  isValidBST(node = this.root, min = -Infinity, max = Infinity) {
    if (!node) return true;
    if (node.value <= min || node.value >= max) return false;
    return this.isValidBST(node.left, min, node.value) && 
           this.isValidBST(node.right, node.value, max);
  }

  getNodeDepth(value) {
    let depth = 0;
    let current = this.root;
    
    while (current) {
      if (value === current.value) return depth;
      current = value < current.value ? current.left : current.right;
      depth++;
    }
    return -1;
  }

  clearVisited(node = this.root) {
    if (!node) return;
    node.isVisited = false;
    node.isNew = false;
    this.clearVisited(node.left);
    this.clearVisited(node.right);
  }

  inorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      traverse(current.left);
      this.traversalOrder.push(current);
      traverse(current.right);
    };
    traverse(node);
    return this.traversalOrder;
  }

  preorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      this.traversalOrder.push(current);
      traverse(current.left);
      traverse(current.right);
    };
    traverse(node);
    return this.traversalOrder;
  }

  postorderTraversal(node = this.root) {
    this.traversalOrder = [];
    const traverse = (current) => {
      if (!current) return;
      traverse(current.left);
      traverse(current.right);
      this.traversalOrder.push(current);
    };
    traverse(node);
    return this.traversalOrder;
  }

  levelOrderTraversal() {
    if (!this.root) return [];
    
    const result = [];
    const queue = [this.root];
    
    while (queue.length > 0) {
      const level = [];
      const levelSize = queue.length;
      
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        level.push(node);
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      
      result.push(level);
    }
    
    this.traversalOrder = result.flat();
    return this.traversalOrder;
  }

  getLeafNodes() {
    const leaves = [];
    const traverse = (node) => {
      if (!node) return;
      if (!node.left && !node.right) leaves.push(node);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(this.root);
    return leaves;
  }
}

class BST extends BaseBST {
  insert(value) {
    if (value < this.minValue) this.minValue = value;
    if (value > this.maxValue) this.maxValue = value;

    const newNode = new TreeNode(value);
    this.nodeCount++;

    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
    this.updateHeights();
  }

  updateHeights(node = this.root) {
    if (!node) return 0;
    const leftHeight = this.updateHeights(node.left);
    const rightHeight = this.updateHeights(node.right);
    node.height = Math.max(leftHeight, rightHeight) + 1;
    node.balanceFactor = leftHeight - rightHeight;
    return node.height;
  }

  delete(value) {
    const deleteNode = (node, val) => {
      if (!node) return null;

      if (val < node.value) {
        node.left = deleteNode(node.left, val);
      } else if (val > node.value) {
        node.right = deleteNode(node.right, val);
      } else {
        this.nodeCount--;
        if (!node.left && !node.right) return null;
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let temp = node.right;
        while (temp.left) temp = temp.left;
        node.value = temp.value;
        node.right = deleteNode(node.right, temp.value);
      }

      this.updateHeight(node);
      return node;
    };

    this.root = deleteNode(this.root, value);
    this.updateHeights();
  }
}

class AVLTree extends BaseBST {
  getBalanceFactor(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);
    
    y.balanceFactor = this.getBalanceFactor(y);
    x.balanceFactor = this.getBalanceFactor(x);

    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);
    
    x.balanceFactor = this.getBalanceFactor(x);
    y.balanceFactor = this.getBalanceFactor(y);

    return y;
  }

  insert(value) {
    if (value < this.minValue) this.minValue = value;
    if (value > this.maxValue) this.maxValue = value;

    const insertNode = (node, val) => {
      if (!node) {
        this.nodeCount++;
        return new TreeNode(val);
      }

      if (val < node.value) {
        node.left = insertNode(node.left, val);
      } else {
        node.right = insertNode(node.right, val);
      }

      this.updateHeight(node);
      node.balanceFactor = this.getBalanceFactor(node);
      
      const balance = this.getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && val < node.left.value) {
        return this.rotateRight(node);
      }

      // Right Right Case
      if (balance < -1 && val > node.right.value) {
        return this.rotateLeft(node);
      }

      // Left Right Case
      if (balance > 1 && val > node.left.value) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right Left Case
      if (balance < -1 && val < node.right.value) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = insertNode(this.root, value);
  }

  delete(value) {
    const deleteNode = (node, val) => {
      if (!node) return null;

      if (val < node.value) {
        node.left = deleteNode(node.left, val);
      } else if (val > node.value) {
        node.right = deleteNode(node.right, val);
      } else {
        this.nodeCount--;
        if (!node.left && !node.right) return null;
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let temp = node.right;
        while (temp.left) temp = temp.left;
        node.value = temp.value;
        node.right = deleteNode(node.right, temp.value);
      }

      if (!node) return null;

      this.updateHeight(node);
      node.balanceFactor = this.getBalanceFactor(node);
      
      const balance = this.getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        return this.rotateRight(node);
      }

      // Left Right Case
      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right Right Case
      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        return this.rotateLeft(node);
      }

      // Right Left Case
      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = deleteNode(this.root, value);
  }
}
const TreeVisualizer = () => {
  const [treeType, setTreeType] = useState('bst');
  const [bst] = useState(new BST());
  const [avl] = useState(new AVLTree());
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [traversalResult, setTraversalResult] = useState('');
  const [nodeCount, setNodeCount] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [showBalanceFactors, setShowBalanceFactors] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);
  const traversalIntervalRef = useRef(null);
  const [currentTraversalIndex, setCurrentTraversalIndex] = useState(0);
  const [treeStats, setTreeStats] = useState({
    height: 0,
    leafCount: 0,
    isBalanced: true,
    isBST: true
  });

  const currentTree = treeType === 'bst' ? bst : avl;

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const updateTree = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const treeGroup = svgElement.querySelector('#treeGroup');
    if (!treeGroup) return;

    treeGroup.innerHTML = '';
    setNodeCount(currentTree.nodeCount);

    if (!currentTree.root) return;

    const drawNode = (node, x, y, level = 1) => {
      if (!node) return;

      const nodeX = x;
      const nodeY = y;

      if (node.left) {
        const childX = x - (200 / level);
        const childY = y + 60;
        treeGroup.innerHTML += `
          <line 
            x1="${nodeX}" y1="${nodeY}"
            x2="${childX}" y2="${childY}"
            stroke="#94a3b8"
            stroke-width="2"
          />
        `;
        drawNode(node.left, childX, childY, level + 1);
      }

      if (node.right) {
        const childX = x + (200 / level);
        const childY = y + 60;
        treeGroup.innerHTML += `
          <line
            x1="${nodeX}" y1="${nodeY}"
            x2="${childX}" y2="${childY}"
            stroke="#94a3b8"
            stroke-width="2"
          />
        `;
        drawNode(node.right, childX, childY, level + 1);
      }

      let color = '#ffffff';
      if (node.isVisited) color = '#93c5fd';
      else if (node.isNew) color = '#86efac';
      else if (selectedNode === node) color = '#fde047';

      treeGroup.innerHTML += `
        <g class="node" data-value="${node.value}">
          <circle
            cx="${nodeX}" cy="${nodeY}" r="20"
            fill="${color}"
            stroke="#475569"
            stroke-width="2"
          />
          <text
            x="${nodeX}" y="${nodeY}"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="14"
            font-weight="bold"
          >${node.value}</text>
          ${showBalanceFactors ? `
            <text
              x="${nodeX}" y="${nodeY - 30}"
              text-anchor="middle"
              font-size="12"
              fill="#6b7280"
            >${node.balanceFactor}</text>
          ` : ''}
          </g>
        `;
    };

    drawNode(currentTree.root, svgElement.clientWidth / 2, 40);

    // Update tree statistics
    const stats = {
      height: currentTree.root ? currentTree.root.height : 0,
      leafCount: currentTree.getLeafNodes().length,
      isBalanced: treeType === 'avl' || Math.abs(currentTree.getBalanceFactor(currentTree.root)) <= 1,
      isBST: currentTree.isValidBST()
    };
    setTreeStats(stats);
  };

  useEffect(() => {
    updateTree();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTree.root, showBalanceFactors, selectedNode, treeType]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    if (currentTree.search(value).found) {
      showMessage('Value already exists in the tree', 'error');
      return;
    }

    currentTree.insert(value);
    setInputValue('');
    showMessage('Node inserted successfully', 'success');
    updateTree();
  };

  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    if (!currentTree.search(value).found) {
      showMessage('Value not found in the tree', 'error');
      return;
    }

    currentTree.delete(value);
    setInputValue('');
    showMessage('Node deleted successfully', 'success');
    updateTree();
  };

  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      showMessage('Please enter a valid number', 'error');
      return;
    }

    const { found, path } = currentTree.search(value);
    if (found) {
      showMessage('Value found in the tree', 'success');
      setSelectedNode(path[path.length - 1]);
    } else {
      showMessage('Value not found in the tree', 'error');
    }
    updateTree();
    setTimeout(() => {
      currentTree.clearVisited();
      setSelectedNode(null);
      updateTree();
    }, 2000);
  };

  const startTraversal = (type) => {
    if (traversalIntervalRef.current) {
      clearInterval(traversalIntervalRef.current);
    }

    let nodes;
    switch (type) {
      case 'inorder':
        nodes = currentTree.inorderTraversal();
        break;
      case 'preorder':
        nodes = currentTree.preorderTraversal();
        break;
      case 'postorder':
        nodes = currentTree.postorderTraversal();
        break;
      case 'levelorder':
        nodes = currentTree.levelOrderTraversal();
        break;
      default:
        return;
    }

    setCurrentTraversalIndex(0);
    const traversalText = nodes.map(node => node.value).join(' → ');
    setTraversalResult(`${type.charAt(0).toUpperCase() + type.slice(1)} Traversal: ${traversalText}`);

    let index = 0;
    traversalIntervalRef.current = setInterval(() => {
      if (index < nodes.length) {
        currentTree.clearVisited();
        nodes[index].isVisited = true;
        setCurrentTraversalIndex(index);
        updateTree();
        index++;
      } else {
        clearInterval(traversalIntervalRef.current);
        setTimeout(() => {
          currentTree.clearVisited();
          updateTree();
        }, animationSpeed);
      }
    }, animationSpeed);
  };

  const resetTree = () => {
    currentTree.reset();
    setTraversalResult('');
    setSelectedNode(null);
    setNodeCount(0);
    showMessage('Tree reset successfully', 'success');
    updateTree();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 border rounded-lg shadow-lg bg-white">
      <div className="text-2xl font-bold mb-6 text-center text-blue-600">Binary Tree Visualizer</div>
      <div className="flex flex-col gap-6">
        <div className="flex gap-4 flex-wrap justify-center">
          <select 
            value={treeType} 
            onChange={(e) => setTreeType(e.target.value)}
            className="border rounded px-3 py-2 bg-white shadow-sm"
          >
            <option value="bst">Binary Search Tree</option>
            <option value="avl">AVL Tree</option>
          </select>
          
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number"
            className="border rounded px-3 py-2 w-40 shadow-sm"
          />
          
          <button onClick={handleInsert} className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition-colors">Insert</button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition-colors">Delete</button>
          <button onClick={handleSearch} className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition-colors">Search</button>
          <button onClick={resetTree} className="border px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors">Reset</button>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => startTraversal('inorder')} className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition-colors">Inorder</button>
          <button onClick={() => startTraversal('preorder')} className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition-colors">Preorder</button>
          <button onClick={() => startTraversal('postorder')} className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition-colors">Postorder</button>
          <button onClick={() => startTraversal('levelorder')} className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600 transition-colors">Level Order</button>
          <button 
            onClick={() => setShowBalanceFactors(!showBalanceFactors)}
            className="border px-4 py-2 rounded shadow hover:bg-gray-100 transition-colors"
          >
            {showBalanceFactors ? 'Hide' : 'Show'} Balance Factors
          </button>
        </div>

        {message.text && (
          <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-4">
          <svg
            ref={svgRef}
            width="100%"
            height="500"
            className="border rounded-lg shadow-inner"
          >
            <g id="treeGroup" transform="translate(0, 0)"></g>
          </svg>
        </div>

        {traversalResult && (
          <div className="text-sm text-slate-600 text-center">
            {traversalResult}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-center">
          <div>Nodes: {nodeCount}</div>
          <div>Height: {treeStats.height}</div>
          <div>Leaf Nodes: {treeStats.leafCount}</div>
          <div>Balanced: {treeStats.isBalanced ? 'Yes' : 'No'}</div>
          <div>Valid BST: {treeStats.isBST ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;