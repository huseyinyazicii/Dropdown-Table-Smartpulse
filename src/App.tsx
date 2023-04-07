import DropdownTable, { ServerDataResult } from "./components/DropdownTable";
import {  IServerSideGetRowsRequest } from "ag-grid-enterprise";

const App = () => {

    const selectedData = (data: Array<any>) => {
        console.log(data);
    };

    // Clientside Data
    const rowData = [
        { id: 21, title: "Daal Masoor 500 grams",  price: 20 },
        { id: 22, title: "Elbow Macaroni - 400 gm",  price: 30 },
        { id: 23, title: "Orange Essence Food Flavou",  price: 40 },
        { id: 24, title: "cereals muesli fruit nuts",  price: 50 },
        { id: 25, title: "Gulab Powder 50 Gram",  price: 60 },
        { id: 26, title: "- Daal Masoor 500 grams",  price: 70 },
        { id: 27, title: "- Daal Masoor 500 grams",  price: 20 },
        { id: 28, title: "- Daal Masoor 500 grams",  price: 20 },
    ];

    // Serverside Data
    const getData = async (request: IServerSideGetRowsRequest) : Promise<ServerDataResult> => {
        const response = await fetch(
            `https://dummyjson.com/products?limit=${request.endRow! - request.startRow!}&skip=${request.startRow}&select=title,price`
        );
        const data = await response.json();
        return {
            rows: data.products,
            totalRow: data.total,
        };
    };

    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <DropdownTable
                // pageSize={5}
                // width={800} 
                rowData={getData} 
                selectedData={selectedData} 
            />
        </div>
    );
};

export default App;
