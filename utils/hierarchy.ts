export interface Unit {
  id: number
  nome: string
  sigla: string | null
  idSuperior: number
  superior: string
  corporacao: string
  corporacaoId: number
  telefone: string | null
  tipoEstruturaOrg: string
  tipoEstruturaOrgId: number
  tipoEstruturaOrgNome: string
}

export interface TreeNode {
  title: string
  value: string
  key: string
  children?: TreeNode[]
}

export function buildTree(items: Unit[]): TreeNode[] {
  const itemMap = new Map<number, TreeNode>()
  const roots: TreeNode[] = []

  // Passo 1: Criar todos os nós
  items.forEach(item => {
    itemMap.set(item.id, {
      title: item.sigla ? `${item.sigla} - ${item.nome}` : item.nome,
      value: item.id.toString(),
      key: item.id.toString(),
      children: []
    })
  })

  // Passo 2: Vincular filhos aos pais
  items.forEach(item => {
    const node = itemMap.get(item.id)!
    
    // Verificar se é raiz (auto-referência ou sem pai no mapa)
    if (item.id === item.idSuperior) {
      roots.push(node)
    } else {
      const parent = itemMap.get(item.idSuperior)
      if (parent) {
        parent.children?.push(node)
      } else {
        // Se o pai não for encontrado no conjunto de dados, trata como raiz
        roots.push(node)
      }
    }
  })

  // Limpeza e adição do sufixo (Todas)
  const processNodes = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // Adiciona o sufixo (Todas) se for um nó pai
        node.title = `${node.title} (Todas)`
        processNodes(node.children)
      } else {
        // Remove propriedade children se estiver vazia
        delete node.children
      }
    })
  }

  processNodes(roots)
  return roots
}
