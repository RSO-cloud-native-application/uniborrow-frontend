import logo from './logo.svg';
import './App.css';
import {useState} from "react";

function LoginForm(props) {
    const [userInput, setUserInput] = useState("")

    function submit() {
        props.onSubmit(userInput)
    }

    return <div><input type="text" value={userInput} onChange={e => setUserInput(e.target.value)}/>
        <div onClick={() => submit()}>Submit</div>
    </div>

}

function Item(props) {
    const item = props.item
    return <div className="item">
        <div>{item.title}</div>
        <div className="image-wrapper"><img src={item.uri}/></div>
        <div>{item.description}</div>
        <div>{item.status}</div>
        <div onClick={() => props.onBorrow()}>Borrow</div>
    </div>
}

function ItemList(props) {
    const items = [{
        "category": "Books",
        "description": "Novel written by Leo Tolstoy.",
        "imageId": 1,
        "score": 1325,
        "status": "Available",
        "title": "War and Peace",
        "uri": "https://images-na.ssl-images-amazon.com/images/I/51J1nb00FLL._SX330_BO1,204,203,200_.jpg",
        "userId": 1
    }, {
        "category": "Vehicle",
        "description": "The ultimate bike for mountain off-road adventures! The most successful \"solid\" with a new \"racing\" geometry for even more power, stability and precision!",
        "imageId": 2,
        "score": 1325,
        "status": "Available",
        "title": "Mountain bike Olympia F1",
        "uri": "https://bike-shop.si/content/images/thumbs/0002065_gorsko-kolo-lf-sonora-29.jpeg",
        "userId": 1
    }, {
        "category": "Books",
        "description": "Novel written by Leo Tolstoy.",
        "imageId": 3,
        "score": 1325,
        "status": "Available",
        "title": "War and Peace",
        "uri": "https://images-na.ssl-images-amazon.com/images/I/51J1nb00FLL._SX330_BO1,204,203,200_.jpg",
        "userId": 1
    }]

    function onBorrow(i) {
        props.onBorrow(items[i].imageId)
    }

    return <div className="item-list">
        {items.map((item, i) => <Item onBorrow={() => onBorrow(i)} item={item}></Item>)}
    </div>
}


function ItemBorrowForm(props) {
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [description, setDescription] = useState("")

    return <div className="item-borrow-form">
        <div> Description <input onChange={e=> setDescription(e.target.value)} value={description} type="text"/></div>
        <div>From <input onChange={e=> setFromDate(e.target.value)} value={fromDate} type="date"/></div>
        <div>To <input onChange={e=> setToDate(e.target.value)} value={toDate} type="date"/></div>
        <div onClick={()=> props.submitLoanProposal(fromDate,toDate,description)}>Submit</div>
    </div>
}

function App() {

    const [userId, setUserId] = useState(null)
    const [borrowingId, setBorrowingId] = useState(null)

    function submitLoanProposal(from,to,desc){
        console.log("submitting proposal" + from)
    }

    const render = () => {
        if (userId) {
            if (borrowingId) {
                return <ItemBorrowForm submitLoanProposal={submitLoanProposal} itemId={borrowingId}>Form for borrowing item</ItemBorrowForm>
            } else {
                return <ItemList onBorrow={setBorrowingId}/>
            }
        } else {
            return <LoginForm onSubmit={id => setUserId(id)}/>
        }
    }

    return (
        <div className="App">
            {render()}
        </div>
    );
}

export default App;
