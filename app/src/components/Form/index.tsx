import { useState } from "react";

export function Form() {
    const [form, setForm] = useState({
        title: "",
        author: "",
        publishedYear: "",
        genre: ""
    })

    
    function handleChange(e: any) {
        const { value, id } = e.target;
        setForm((prevForm) => ({ ...prevForm, [id]: value }))
    }

    async function handleCreatebook(){
        try {
            const response = axios.post('', form);
            if(response.status === 200){

            }
        } catch (error) {
            if(error.status === 404){
                alert("")
            }
        }
    }


    return (
        <form onSubmit={handleCreatebook}>
            <input type="text" id="title" value={form.title} onChange={handleChange} />
            <input type="text" id="author" value={form.author} onChange={handleChange} />
            <input type="text" id="publishedYear" value={form.publishedYear} onChange={handleChange} />
            <input type="text" id="genre" value={form.genre} onChange={handleChange} />
        </form>
    )
}