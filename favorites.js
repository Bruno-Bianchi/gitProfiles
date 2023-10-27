import { GithubUser } from "./GithubUser.js"

// Classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
  constructor(root){
    this.root = document.querySelector(root)
    this.load()

  } 

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [] //JSON.parse converte e salva no localStorage
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
  }

  async add(username) { //função assíncrona
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists){
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username) //await - espera a promessa
      
      if(user.login === undefined){
        throw new Error("Usuário não encontrado!")
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    }catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry =>
      entry.login !== user.login) //recriando array

    this.entries = filteredEntries //reatribuindo novo array 
    this.update()
    this.save()
  }
}

// Classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
  constructor(root) { // root será a div 'app'
    super(root) // como está estendendo do Favorites, o super é o CONSTRUCTOR  da classe Favorites
  
    this.tbody = this.root.querySelector("table tbody") // pegando o tbory da tabela

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = () => {
      const { value } = this.root.querySelector(".search input") // {value} desestruturando e pegando somente o value 
    
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach( user => {
      const row = this.createRow()

      row.querySelector(".user img").src = `https://github.com/${user.login}.png`
      row.querySelector(".user img").alt = `Imagem de ${user.name}`
      row.querySelector(".user a").href = `https://github.com/${user.login}`
      row.querySelector(".user p").textContent = user.name 
      row.querySelector(".user span").textContent = user.login
      row.querySelector(".repositories").textContent = user.public_repos
      row.querySelector(".followers").textContent = user.followers

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm(`Tem certeza que deseja deletar essa linha?`)
        
        if(isOk) {
          this.delete(user)
        }
      } // não vou mais precisar adicionar eventos no botão em toda minha aplicação -> onclick | mais de um evento p/ botão na aplicação -> addEventListener

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement("tr") // tr precisa ser criado
    // pela DOM pois é html

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/Bruno-Bianchi.png" alt="imagem do isuário">
        <a href="https://github.com/Bruno-Bianchi" target="_blank">
          <p>Bruno Bianchi</p>
          <span>brunobianchi</span>
        </a>
      </td>
      <td class="repositories">
        76
      </td>
      <td class="followers">
        9000
      </td>
      <td> 
        <button class="remove">&times;</button>
      </td>
    `
     return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove()
    }) //pegando todas as linhas e removendo
  }
}