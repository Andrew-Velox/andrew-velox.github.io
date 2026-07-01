'use client';
import { motion } from 'framer-motion';

const achievementsData = [
	{
		section: 'Regional Programming Contests',
		items: [
			{
				title: 'ICPC ASIA DHAKA REGIONAL CONTEST 2024',
				link: 'https://bapsoj.org/contests/icpc-asia-dhaka-regional-contest-2024-onsite-round',
				rank: '174',
				date: 'December 7, 2024',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'MIAKI PRESENTS KUET IUPC ONSITE 2025',
				link: 'https://bapsoj.org/contests/miaki-presents-kuet-iupc-onsite-2025',
				rank: '119',
				date: 'January 4, 2025',
				place: 'Khulna, Bangladesh',
			},
			{
				title: 'UIU IUPC CONTEST 2025',
				link: 'https://bapsoj.org/contests/uiu-inter-university-programming-contest-2025',
				rank: '116',
				date: 'January 18, 2025',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'MTB Presents AUST IUPC 2025',
				link: 'https://toph.co/c/mtb-presents-aust-inter-university-2025',
				rank: '86',
				date: 'February 22, 2025',
				place: 'Dhaka, Bangladesh',
			},
			{
				title: 'BUBT IUCPC 2025',
				link: 'https://toph.co/c/bubt-inter-university-collaborative',
				rank: '36',
				date: 'November 29, 2025',
				place: 'Dhaka, Bangladesh',
			},
		],
	},
	{
		section: 'University Contest',
		items: [
			{
				title: 'Inter Departmental Programming Contest 2024',
				rank: 'Champion',
				date: 'October 4, 2024',
				place: 'Green University of Bangladesh',
			},
		],
	},
	{
		section: 'Hackathon',
		items: [
			{
				title: 'No hackathon participation yet, but soon Inshallah!',
			},
		],
	},
];

function AchievementCard({ item }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
			className="relative flex items-start"
		>
			{/* Timeline dot */}
			<span className="absolute left-3 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow" />
			<div className="ml-16 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex-1 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl bg-white/10 dark:bg-white/5 backdrop-blur-md">
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
					<span className="font-semibold text-lg text-white-700 dark:text-white-400">
						{item.link ? (
							<a
								href={item.link}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-blue-500"
							>
								{item.title}
							</a>
						) : (
							item.title
						)}
					</span>
					{(item.place || item.date) && (
						<span className="text-right text-gray-400 text-sm flex flex-col items-end">
							{item.place && <span>{item.place}</span>}
							{item.date && <span>{item.date}</span>}
						</span>
					)}
				</div>
				{item.rank && (
					<div className="italic text-green-400 font-bold text-sm mb-1">
						Rank: {item.rank}
					</div>
				)}
			</div>
		</motion.div>
	);
}

export default function Achievements() {
	return (
		<div className="min-h-screen w-full bg-gradient-to-r text-white">
			<div className="flex flex-col items-center justify-center min-h-screen w-full">
				<div className="max-w-3xl w-full mx-auto px-4 py-10">
					<h1 className="text-4xl font-bold mb-2 text-center">Achievements</h1>
					<div className="w-24 h-1 bg-white mx-auto mb-10 rounded-full" />
					<div className="space-y-16">
						{achievementsData.map((section) => (
							<div key={section.section}>
								<h2 className="text-2xl font-bold mb-6 text-white-700 dark:text-white-400">
									{section.section}
								</h2>
								<div className="relative">
									{/* Timeline vertical line for this section */}
									<div className="absolute left-6 top-0 w-0.5 h-full bg-white" />
									<div className="space-y-8">
										{section.items.map((item) => (
											<AchievementCard key={item.title} item={item} />
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
