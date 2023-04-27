import React, { useState } from 'react'

type FeedbackBoxProps = {
  name?: string;
  email?: string;
};

export default function FeedbackBox({ name = "default", email = "default" }: FeedbackBoxProps) {
	const [feedback, setFeedback] = useState("");

	const handleFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!feedback) {
			alert('Please enter the feedback');
			return;
		}
		await fetch('/api/email/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({name, email, feedback})
		})

		alert('Thanks for the feedback')
		setFeedback('')
	}
		
	return (
		<form onSubmit={handleFeedback}
		className='fixed bottom-2 right-2 rounded-m bg-green-100 00 p-3 rounded-md'>
			<p className='mb-1'>feedback?, let me know</p>
			<textarea 
				className="mb-1 text-sm w-full" name="suggest" 
				id="suggest" 
				onChange={(e) => setFeedback(e.target.value)}
				value={feedback}
				cols={20}
				rows={3}>
			</textarea><br/>
			<button className="w-full bg-green-400 rounded-md" type="submit">Send</button>
		</form>
	)
}