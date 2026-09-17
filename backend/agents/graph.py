from langgraph.graph import StateGraph, END

from agents.state import IcebreakerState
from agents.nodes import (
    validation_node,
    duplicate_check_node,
    moderation_node,
    embed_and_store_node,
    pool_check_node,
    matching_node,
    question_gen_node,
    quality_check_node,
    repetition_check_node,
    output_node,
    feedback_node,
    error_node,
    waiting_node,
)


def route_after_validation(state: IcebreakerState) -> str:
    return "duplicate_check" if state["validation_passed"] else "error"


def route_after_duplicate(state: IcebreakerState) -> str:
    return "error" if state["is_duplicate"] else "moderation"


def route_after_moderation(state: IcebreakerState) -> str:
    return "embed_and_store" if state["moderation_passed"] else "error"


def route_after_pool_check(state: IcebreakerState) -> str:
    return "matching" if state["pool_ready"] else "waiting"


def route_after_matching(state: IcebreakerState) -> str:
    return "question_gen" if state["matched_profile"] else "error"


def route_after_quality_check(state: IcebreakerState) -> str:
    if state["quality_passed"]:
        return "repetition_check"
    return "question_gen"  # retry loop


def route_after_repetition_check(state: IcebreakerState) -> str:
    return "output" if state["questions_are_unique"] else "question_gen"


def build_graph() -> StateGraph:
    graph = StateGraph(IcebreakerState)

    # Add all nodes
    graph.add_node("validation", validation_node)
    graph.add_node("duplicate_check", duplicate_check_node)
    graph.add_node("moderation", moderation_node)
    graph.add_node("embed_and_store", embed_and_store_node)
    graph.add_node("pool_check", pool_check_node)
    graph.add_node("matching", matching_node)
    graph.add_node("question_gen", question_gen_node)
    graph.add_node("quality_check", quality_check_node)
    graph.add_node("repetition_check", repetition_check_node)
    graph.add_node("output", output_node)
    graph.add_node("feedback", feedback_node)
    graph.add_node("error", error_node)
    graph.add_node("waiting", waiting_node)

    # Entry point
    graph.set_entry_point("validation")

    # Edges
    graph.add_conditional_edges("validation", route_after_validation, {
        "duplicate_check": "duplicate_check",
        "error": "error",
    })

    graph.add_conditional_edges("duplicate_check", route_after_duplicate, {
        "moderation": "moderation",
        "error": "error",
    })

    graph.add_conditional_edges("moderation", route_after_moderation, {
        "embed_and_store": "embed_and_store",
        "error": "error",
    })

    graph.add_edge("embed_and_store", "pool_check")

    graph.add_conditional_edges("pool_check", route_after_pool_check, {
        "matching": "matching",
        "waiting": "waiting",
    })

    graph.add_conditional_edges("matching", route_after_matching, {
        "question_gen": "question_gen",
        "error": "error",
    })

    graph.add_edge("question_gen", "quality_check")

    graph.add_conditional_edges("quality_check", route_after_quality_check, {
        "repetition_check": "repetition_check",
        "question_gen": "question_gen",
    })

    graph.add_conditional_edges("repetition_check", route_after_repetition_check, {
        "output": "output",
        "question_gen": "question_gen",
    })

    graph.add_edge("output", "feedback")
    graph.add_edge("feedback", END)
    graph.add_edge("error", END)
    graph.add_edge("waiting", END)

    return graph.compile()


icebreaker_graph = build_graph()
