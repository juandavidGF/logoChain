import React, { useState } from 'react'

type SuggestionBoxProps = {
  name?: string;
  email?: string;
};

export default function SuggestionBox({ name = "default", email = "default" }: SuggestionBoxProps) {
	const [suggestion, setSuggestion] = useState("");

	const handleSuggestion = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!suggestion) {
			alert('Please enter a suggestion');
			return;
		}
		// send to backend
		await fetch('/api/email/suggestion', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({name, email, suggestion})
		})

		setSuggestion('')
		return
	}
		
	return (
		<form onSubmit={handleSuggestion}
		className='fixed bottom-2 right-2 rounded-m bg-green-100 00 p-3 rounded-md'>
			<p className='mb-1'>suggestions?, let me know</p>
			<textarea 
				className="mb-1 text-sm w-full" name="suggest" 
				id="suggest" 
				onChange={(e) => setSuggestion(e.target.value)}
				value={suggestion}
				cols={20}
				rows={3}>
			</textarea><br/>
			<button className="w-full bg-green-400 rounded-md" type="submit">Send</button>
		</form>
	)
}