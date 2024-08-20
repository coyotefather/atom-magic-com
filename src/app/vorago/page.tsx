'use client';
import {Breadcrumbs, BreadcrumbItem} from "@nextui-org/breadcrumbs";
import Header from '@/app/components/common/Header';
import Section from '@/app/components/common/Header';

const Page = () => {
	return (
		<main className="inconsolata min-h-screen pt-12">
			<Header name="Vorago">
				<Breadcrumbs>
				  <BreadcrumbItem>Home</BreadcrumbItem>
				  <BreadcrumbItem>Vorago</BreadcrumbItem>
				</Breadcrumbs>
				Coming soon!
			</Header>
			<Section name="Play Vorago">
				Game board here.
			</Section>
		</main>
	);
};

export default Page;